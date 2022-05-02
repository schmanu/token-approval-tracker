import { SafeAppProvider } from '@gnosis.pm/safe-apps-provider';
import { ethers } from 'ethers';
import { hexZeroPad, LogDescription } from 'ethers/lib/utils';

import { getAllowance } from '../../actions/allowance';
import { ERC20__factory } from '../../contracts';
import { networkInfo } from '../../networks';
import { reduceToMap } from '../../utils/arrayReducers';
import { TokenInfo } from '../tokens/TokenStore';

import { AccumulatedApproval } from './TransactionStore';

interface TransactionLog {
  tokenAddress: string;
  txHash: string;
  blockHash: string;
  timestamp: number;
  parsedLog: LogDescription;
}

export const fetchApprovalsOnChain: (
  safeAddress: string,
  safeAppProvider: SafeAppProvider,
) => Promise<TransactionLog[]> = async (safeAddress, safeAppProvider) => {
  const web3Provider = new ethers.providers.Web3Provider(safeAppProvider);
  const contractInterface = new ethers.utils.Interface(ERC20__factory.abi);
  const approvalLogs = await web3Provider
    .getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: [ethers.utils.id('Approval(address,address,uint256)'), hexZeroPad(safeAddress, 32)],
    })
    .then((logs) =>
      logs.map((log) => ({
        tokenAddress: log.address,
        txHash: log.transactionHash,
        blockHash: log.blockHash,
        parsedLog: contractInterface.parseLog(log),
      })),
    );

  return await Promise.all(
    approvalLogs.map(async (log) => ({
      ...log,
      timestamp: (await web3Provider.getBlock(log.blockHash)).timestamp,
    })),
  );
};

/**
 * Fetches all approval txs for a safeAddress and network.
 *
 * @param safeAddress address of the connected safe
 * @param safeAppProvider web3 provider
 * @returns approve transactions grouped by token and spender address containing the remaining allowance
 */
export const fetchApprovalTransactions = async (safeAddress: string, safeAppProvider: SafeAppProvider) => {
  const transactionsByToken = await fetchApprovalsOnChain(safeAddress, safeAppProvider)
    .then((transactions) => transactions.sort((a, b) => b.timestamp - a.timestamp))
    .then((transactions) => reduceToMap(transactions, (obj) => obj.tokenAddress))
    .catch((reason) => {
      console.error(`Error while fetching approval transactions: ${reason}`);
      return new Map<string, TransactionLog[]>();
    });

  const result: AccumulatedApproval[] = [];
  for (const tokenEntry of transactionsByToken.entries()) {
    const transactions = tokenEntry[1];
    const transactionsBySpender = reduceToMap(transactions, (tx) => {
      return tx.parsedLog.args[1] as string;
    });

    for (const spenderEntry of transactionsBySpender.entries()) {
      const allowance = await getAllowance(safeAddress, tokenEntry[0], spenderEntry[0], safeAppProvider);
      if (typeof allowance !== 'undefined') {
        result.push({
          spender: spenderEntry[0],
          tokenAddress: tokenEntry[0],
          allowance: allowance.toFixed(),
          transactions: spenderEntry[1].map((tx) => ({
            executionDate: tx.timestamp * 1000, // millis
            txHash: tx.txHash,
            value: (tx.parsedLog.args[2] as ethers.BigNumber).toHexString(),
          })),
        });
      }
    }
  }
  return result;
};

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
      .catch((reason) => {
        console.error(`Error while loading token info for address ${tokenAddress}: ${reason}`);
      });
  }
};
