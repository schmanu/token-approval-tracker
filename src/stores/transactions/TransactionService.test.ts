import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';

import { createMockSafeAppProvider } from '../../testutils/utils';
import { toWei } from '../../wei';

import { fetchApprovalTransactions } from './TransactionService';

const spenderAddress = '0x1000000000000000000000000000000000000000';
const spenderAddress2 = '0x2000000000000000000000000000000000000000';

const tokenAddress = '0x0000000000000000000000000000000000000001';
const tokenAddress2 = '0x0000000000000000000000000000000000000002';

const safeAddress = '0x54F3000000000000000000000000000000000000';

describe('TransactionStore', () => {
  test('Empty Transaction History', () => {
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
  test('Single Approve Transaction', async () => {
    const safeProvider = createMockSafeAppProvider({
      allowance: new BigNumber(42),
      decimals: 18,
      approvalLogs: [
        {
          tokenAddress,
          allowance: new BigNumber(69),
          ownerAddress: ethers.utils.hexZeroPad(safeAddress, 32),
          spenderAddress: ethers.utils.hexZeroPad(spenderAddress, 32),
          timeStamp: 1,
        },
      ],
    });

    const approvalsTxs = await fetchApprovalTransactions(safeAddress, safeProvider);

    expect(approvalsTxs).toHaveLength(1);
    expect(approvalsTxs[0].allowance).toBe(toWei(42, 18).toFixed());
    expect(approvalsTxs[0].spender).toBe(spenderAddress);
    expect(approvalsTxs[0].tokenAddress).toBe(tokenAddress);
    expect(approvalsTxs[0].transactions).toHaveLength(1);
    expect(approvalsTxs[0].transactions[0].txHash).toBe(ethers.utils.hexZeroPad('0x1', 32));
    expect(approvalsTxs[0].transactions[0].executionDate).toBe(1000);
    expect(approvalsTxs[0].transactions[0].value).toBe(
      ethers.utils.hexlify(ethers.BigNumber.from(toWei(69, 18).toFixed())),
    );
  });

  test('Multiple Approve Transaction', async () => {
    const safeProvider = createMockSafeAppProvider({
      allowance: new BigNumber(0),
      decimals: 18,
      approvalLogs: [
        {
          tokenAddress,
          allowance: new BigNumber(69),
          ownerAddress: ethers.utils.hexZeroPad(safeAddress, 32),
          spenderAddress: ethers.utils.hexZeroPad(spenderAddress, 32),
          timeStamp: 123,
        },
        {
          tokenAddress: tokenAddress2,
          allowance: new BigNumber(42),
          ownerAddress: ethers.utils.hexZeroPad(safeAddress, 32),
          spenderAddress: ethers.utils.hexZeroPad(spenderAddress2, 32),
          timeStamp: 321,
        },
      ],
    });

    const approvalsTxs = await fetchApprovalTransactions(safeAddress, safeProvider);

    expect(approvalsTxs).toHaveLength(2);
    // First approval is for tokenAddress2 because of higher timestamp
    expect(approvalsTxs[0].allowance).toBe(toWei(0, 18).toFixed());
    expect(approvalsTxs[0].spender).toBe(spenderAddress2);
    expect(approvalsTxs[0].tokenAddress).toBe(tokenAddress2);
    expect(approvalsTxs[0].transactions).toHaveLength(1);
    expect(approvalsTxs[0].transactions[0].txHash).toBe(ethers.utils.hexZeroPad(ethers.utils.hexlify(321), 32));
    expect(approvalsTxs[0].transactions[0].executionDate).toBe(321000);
    expect(approvalsTxs[0].transactions[0].value).toBe(
      ethers.utils.hexlify(ethers.BigNumber.from(toWei(42, 18).toFixed())),
    );

    expect(approvalsTxs[1].allowance).toBe(toWei(0, 18).toFixed());
    expect(approvalsTxs[1].spender).toBe(spenderAddress);
    expect(approvalsTxs[1].tokenAddress).toBe(tokenAddress);
    expect(approvalsTxs[1].transactions).toHaveLength(1);
    expect(approvalsTxs[1].transactions[0].txHash).toBe(ethers.utils.hexZeroPad(ethers.utils.hexlify(123), 32));
    expect(approvalsTxs[1].transactions[0].executionDate).toBe(123000);
    expect(approvalsTxs[1].transactions[0].value).toBe(
      ethers.utils.hexlify(ethers.BigNumber.from(toWei(69, 18).toFixed())),
    );
  });
});
