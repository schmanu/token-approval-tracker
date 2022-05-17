import { SafeAppProvider } from '@gnosis.pm/safe-apps-provider';
import { ethers } from 'ethers';
import { hexZeroPad } from 'ethers/lib/utils';

import { getAllowance } from '../../actions/allowance';
import { reduceToMap } from '../../utils/arrayReducers';

import { AccumulatedApproval } from './TransactionStore';

type TransactionLog = ethers.providers.Log & {
  tokenAddress: string;
  txHash: string;
  blockHash: string;
  timestamp: number;
};

export const fetchApprovalsOnChain: (
  safeAddress: string,
  safeAppProvider: SafeAppProvider,
) => Promise<TransactionLog[]> = async (safeAddress, safeAppProvider) => {
  const web3Provider = new ethers.providers.Web3Provider(safeAppProvider);
  const approvalLogs = await web3Provider
    .getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: [ethers.utils.id('Approval(address,address,uint256)'), hexZeroPad(safeAddress, 32)],
    })
    // We filter out mismatching Approval events like ERC721 approvals
    .then((logs) => logs.filter((log) => log.topics.length === 3))
    .then((logs) =>
      logs.map((log) => ({
        ...log,
        tokenAddress: log.address,
        txHash: log.transactionHash,
        blockHash: log.blockHash,
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
    try {
      const transactions = tokenEntry[1];
      const transactionsBySpender = reduceToMap(transactions, (tx) => {
        return `0x${tx.topics[2].slice(26)}`;
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
              value: tx.data,
            })),
          });
        }
      }
    } catch (err) {
      console.info(`Skipping unparsable approval event. ${tokenEntry[0]} is most likely not an ERC20 contract.`);
    }
  }
  return result;
};
