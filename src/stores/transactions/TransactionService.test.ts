import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';

import { createMockSafeAppProvider, ERROR_CAUSING_SPENDER } from '../../testutils/utils';
import { toWei } from '../../utils/wei';

import { fetchApprovalTransactions } from './TransactionService';

const spenderAddress = '0x1000000000000000000000000000000000000000';
const spenderAddress2 = '0x2000000000000000000000000000000000000000';

const tokenAddress = '0x0000000000000000000000000000000000000001';
const tokenAddress2 = '0x0000000000000000000000000000000000000002';

const safeAddress = '0x54F3000000000000000000000000000000000000';

describe('TransactionStore', () => {
  test('should work for empty logs', () => {
    const safeProvider = createMockSafeAppProvider({
      allowance: new BigNumber(69),
      decimals: 18,
      approvalLogs: [],
    });

    expect(fetchApprovalTransactions(safeAddress, safeProvider)).resolves.toHaveLength(0);
  });

  /**
   * Single Approve Transaction which gave an Approval of 69.
   * The remaining allowance of this spender / token is 42.
   */
  test('parses a single approval log entry', async () => {
    const safeProvider = createMockSafeAppProvider({
      allowance: new BigNumber(42),
      decimals: 18,
      approvalLogs: [
        {
          tokenAddress,
          allowance: new BigNumber(69),
          ownerAddress: ethers.utils.hexZeroPad(safeAddress, 32),
          spenderAddress: ethers.utils.hexZeroPad(spenderAddress, 32),
          blockNumber: 0,
          logIndex: 0,
        },
      ],
    });

    const approvalsTxs = await fetchApprovalTransactions(safeAddress, safeProvider);

    expect(approvalsTxs).toHaveLength(1);
    expect(approvalsTxs[0].allowance).toBe(toWei(42, 18).toFixed());
    expect(approvalsTxs[0].spender).toBe(spenderAddress);
    expect(approvalsTxs[0].tokenAddress).toBe(tokenAddress);
  });

  test('skips faulty log entries and continues parsing', async () => {
    const safeProvider = createMockSafeAppProvider({
      allowance: new BigNumber(42),
      decimals: 18,
      approvalLogs: [
        {
          tokenAddress: tokenAddress2,
          allowance: new BigNumber(69),
          ownerAddress: ethers.utils.hexZeroPad(safeAddress, 32),
          spenderAddress: ethers.utils.hexZeroPad(ERROR_CAUSING_SPENDER, 32),
          blockNumber: 0,
          logIndex: 0,
        },
        {
          tokenAddress,
          allowance: new BigNumber(69),
          ownerAddress: ethers.utils.hexZeroPad(safeAddress, 32),
          spenderAddress: ethers.utils.hexZeroPad(spenderAddress, 32),
          blockNumber: 1,
          logIndex: 0,
        },
      ],
    });

    const approvalsTxs = await fetchApprovalTransactions(safeAddress, safeProvider);

    expect(approvalsTxs).toHaveLength(1);
    expect(approvalsTxs[0].allowance).toBe(toWei(42, 18).toFixed());
    expect(approvalsTxs[0].spender).toBe(spenderAddress);
    expect(approvalsTxs[0].tokenAddress).toBe(tokenAddress);
  });

  test('parses multiple approval log entries', async () => {
    const safeProvider = createMockSafeAppProvider({
      allowance: new BigNumber(42),
      decimals: 18,
      approvalLogs: [
        {
          tokenAddress: tokenAddress2,
          allowance: new BigNumber(69),
          ownerAddress: ethers.utils.hexZeroPad(safeAddress, 32),
          spenderAddress: ethers.utils.hexZeroPad(spenderAddress2, 32),
          blockNumber: 1,
          logIndex: 0,
        },
        {
          tokenAddress: tokenAddress2,
          allowance: new BigNumber(42),
          ownerAddress: ethers.utils.hexZeroPad(safeAddress, 32),
          spenderAddress: ethers.utils.hexZeroPad(spenderAddress2, 32),
          blockNumber: 1,
          logIndex: 1,
        },
      ],
    });

    const approvalsTxs = await fetchApprovalTransactions(safeAddress, safeProvider);

    expect(approvalsTxs).toHaveLength(1);
    // First approval is for tokenAddress2 because of highest blockNumber and logIndex
    expect(approvalsTxs[0].allowance).toBe(toWei(42, 18).toFixed());
    expect(approvalsTxs[0].spender).toBe(spenderAddress2);
    expect(approvalsTxs[0].tokenAddress).toBe(tokenAddress2);
  });

  test('can parse the log entries from a bug report', async () => {
    const safeProvider = createMockSafeAppProvider({
      allowance: new BigNumber(42),
      decimals: 18,
      approvalLogs: undefined,
      logReturnType: 'bugReportLog',
    });

    const approvals = await fetchApprovalTransactions(safeAddress, safeProvider);
    expect(approvals).toHaveLength(12);
  });
});
