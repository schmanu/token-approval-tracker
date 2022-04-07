import { SafeAppProvider } from '@gnosis.pm/safe-apps-provider';

import { getAllowance } from '../../actions/allowance';
import { networkInfo } from '../../networks';
import { TokenInfo } from '../tokens/TokenStore';

import { AccumulatedApproval } from './TransactionStore';

interface Transaction {
  safe: string;
  to: string;
  transactionHash: string;
  executionDate: string;
  dataDecoded?: {
    method: string;
    parameters: Array<{
      name: string;
      type: string;
      value: string;
      valueDecoded?: {
        operation: number;
        to: string;
        value: string;
        data: string;
        dataDecoded?: {
          method: string;
          parameters: {
            name: string;
            type: string;
            value: string;
          }[];
        };
      }[];
    }>;
  };
}

const containsApproveTransaction = (tx: Transaction) => {
  const containsApproval =
    'approve' === tx.dataDecoded?.method ||
    ('multiSend' === tx.dataDecoded?.method &&
      (tx.dataDecoded.parameters
        .find((param) => param.name === 'transactions')
        ?.valueDecoded?.some((value) => value.dataDecoded?.method === 'approve') ??
        false));
  return containsApproval;
};

const unpackApprovalTransactions = (tx: Transaction) => {
  const txs: Transaction[] = [];
  if ('approve' === tx.dataDecoded?.method) {
    txs.push(tx);
  } else {
    tx.dataDecoded?.parameters
      .find((param) => param.name === 'transactions')
      ?.valueDecoded?.forEach((innerTx) => {
        if (innerTx.dataDecoded?.method === 'approve') {
          txs.push({
            executionDate: tx.executionDate,
            safe: tx.safe,
            to: innerTx.to,
            transactionHash: tx.transactionHash,
            dataDecoded: innerTx.dataDecoded,
          });
        }
      });
  }

  return txs;
};

export const fetchApprovalTransactions = async (
  safeAddress: string,
  network: number,
  safeAppProvider: SafeAppProvider,
  offset: number = 0,
) => {
  const baseAPIURL = networkInfo.get(network)?.baseAPI;

  if (!baseAPIURL) {
    return [] as AccumulatedApproval[];
  } else {
    return await fetch(
      `${baseAPIURL}/safes/${safeAddress}/all-transactions/?executed=true&queued=false&offset=${offset}`,
    )
      .then((response: Response) => {
        if (response.ok) {
          return response.json() as Promise<{ results: Transaction[] }>;
        } else {
          throw Error(response.statusText);
        }
      })
      .then((response) => response.results)
      .then((response) => response.filter(containsApproveTransaction))
      .then((response) => response.flatMap(unpackApprovalTransactions))
      .then((response) => reduceToMap(response, (obj: Transaction) => obj.to))
      .then(async (approvalMap) => {
        const result: AccumulatedApproval[] = [];
        for (const tokenEntry of approvalMap.entries()) {
          const transactionsBySpender = reduceToMap(tokenEntry[1], (tx) => {
            const spender = tx.dataDecoded?.parameters.find((param) => param.name === 'spender')?.value;
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
                  value: tx.dataDecoded?.parameters.find((param) => param.name === 'value')?.value,
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
