import { SafeAppProvider } from '@gnosis.pm/safe-apps-provider';
import {
  DataDecoded,
  getTransactionDetails,
  getTransactionHistory,
  TransactionDetails,
  TransactionListItem,
} from '@gnosis.pm/safe-react-gateway-sdk';

import { getAllowance } from '../../actions/allowance';
import { networkInfo } from '../../networks';
import { TokenInfo } from '../tokens/TokenStore';

import { AccumulatedApproval } from './TransactionStore';

const baseAPI = 'https://safe-client.gnosis.io';
interface Transaction {
  to: string;
  transactionHash: string | null;
  executionDate: number | null;
  dataDecoded?: DataDecoded;
}

const approveAndMultiSendTransactions = (tx: TransactionListItem) =>
  tx.type === 'TRANSACTION' &&
  tx.transaction.txInfo.type === 'Custom' &&
  (tx.transaction.txInfo.methodName === 'multiSend' || tx.transaction.txInfo.methodName === 'approve');

const containsApproveTransaction = (tx: TransactionDetails | undefined): tx is TransactionDetails => {
  const dataDecoded = tx?.txData?.dataDecoded;
  const containsApproval =
    'approve' === dataDecoded?.method ||
    ('multiSend' === dataDecoded?.method &&
      (dataDecoded?.parameters
        ?.find((param) => param.name === 'transactions')
        ?.valueDecoded?.some((value) => value.dataDecoded?.method === 'approve') ??
        false));
  return containsApproval;
};

const unpackApprovalTransactions = (tx: TransactionDetails) => {
  const txs: Transaction[] = [];
  if (tx.txInfo.type === 'Custom') {
    if ('approve' === tx.txData?.dataDecoded?.method) {
      txs.push({
        executionDate: tx.executedAt,
        to: tx.txData.to.value,
        transactionHash: tx.txHash,
        dataDecoded: tx.txData.dataDecoded,
      });
    } else {
      tx.txData?.dataDecoded?.parameters
        ?.find((param) => param.name === 'transactions')
        ?.valueDecoded?.forEach((innerTx) => {
          if (innerTx.dataDecoded?.method === 'approve') {
            txs.push({
              executionDate: tx.executedAt,
              to: innerTx.to,
              transactionHash: tx.txHash,
              dataDecoded: innerTx.dataDecoded,
            });
          }
        });
    }
  }

  return txs;
};

const fetchTransactionDetails = async (tx: TransactionListItem, chainID: string) => {
  if (tx.type === 'TRANSACTION') {
    return await getTransactionDetails(baseAPI, chainID, tx.transaction.id).catch(() => undefined);
  }
  return undefined;
};

export const fetchApprovalTransactions = async (
  safeAddress: string,
  network: number,
  safeAppProvider: SafeAppProvider,
) => {
  const baseAPIURL = networkInfo.get(network)?.baseAPI;

  if (!baseAPIURL) {
    return [] as AccumulatedApproval[];
  } else {
    const transactionsWithDetails = await getTransactionHistory(baseAPI, `${network}`, safeAddress)
      .then((response) => response.results)
      .then((response) => response.filter(approveAndMultiSendTransactions))
      .then((response) => response.map((tx) => fetchTransactionDetails(tx, `${network}`)));

    return Promise.all(transactionsWithDetails)
      .then((response) => response.filter(containsApproveTransaction))
      .then((response) => response.flatMap(unpackApprovalTransactions))
      .then((response) => reduceToMap(response, (obj: Transaction) => obj.to))
      .then(async (approvalMap) => {
        const result: AccumulatedApproval[] = [];
        for (const tokenEntry of approvalMap.entries()) {
          const transactionsBySpender = reduceToMap(tokenEntry[1], (tx) => {
            const spender = tx.dataDecoded?.parameters?.find((param) => param.type === 'address')?.value as string;
            if (!spender) {
              throw Error('Approvals without spender');
            }
            return spender;
          });

          for (const spenderEntry of transactionsBySpender.entries()) {
            const allowance = await getAllowance(safeAddress, tokenEntry[0], spenderEntry[0], safeAppProvider);
            if (typeof allowance !== 'undefined') {
              result.push({
                spender: spenderEntry[0],
                tokenAddress: tokenEntry[0],
                allowance: allowance.toFixed(),
                transactions: spenderEntry[1].map((tx) => ({
                  executionDate: tx.executionDate,
                  txHash: tx.transactionHash,
                  value: tx.dataDecoded?.parameters?.find((param) => param.type === 'uint256')?.value as string,
                })),
              });
            }
          }
        }
        return result;
      })
      .catch(() => [] as AccumulatedApproval[]);
  }
};

/**
 * Creates Map from an array and a key function.
 * @param list array that should be reduced
 * @param keyFunc computes to which key the list entry will be added
 * @returns a map which maps from keys to all list entries, which computed that key for their value
 */
function reduceToMap<T, K extends string | number>(list: Array<T>, keyFunc: (value: T) => K) {
  return list.reduce((prev, curr) => {
    const key = keyFunc(curr);
    prev.has(key) ? prev.get(key)?.push(curr) : prev.set(key, [curr]);
    return prev;
  }, new Map<K, T[]>());
}

export const fetchTokenInfo = async (tokenAddress: string, network: number) => {
  const baseAPIURL = networkInfo.get(network)?.baseAPI;

  if (!baseAPIURL) {
    return undefined;
  } else {
    return await fetch(`${baseAPIURL}/tokens/${tokenAddress}/`)
      .then((response: Response) => {
        if (response.ok) {
          return response.json() as Promise<TokenInfo>;
        } else {
          throw Error(response.statusText);
        }
      })
      .catch(() => undefined);
  }
};
