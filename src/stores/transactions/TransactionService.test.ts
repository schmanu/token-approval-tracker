import { Operation, TransactionStatus } from '@gnosis.pm/safe-apps-sdk';
import * as gateway from '@gnosis.pm/safe-react-gateway-sdk';
import { TransactionDetails, TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk';
import BigNumber from 'bignumber.js';

import { createMockSafeAppProvider } from '../../testutils/utils';
import { toWei } from '../../wei';

import { fetchApprovalTransactions } from './TransactionService';

const spenderAddress = '0x1000000000000000000000000000000000000000';
const spenderAddress2 = '0x2000000000000000000000000000000000000000';

const tokenAddress = '0x0000000000000000000000000000000000000001';
const tokenAddress2 = '0x0000000000000000000000000000000000000002';

const mockMultiCallAddress = '0x666000000000000000000000000000000000000';

const safeAddress = '0x54F3000000000000000000000000000000000000';

jest.mock('@gnosis.pm/safe-react-gateway-sdk', () => ({
  getTransactionHistory: jest.fn(),
  getTransactionDetails: jest.fn(),
}));

const mockedGateway = gateway as jest.Mocked<typeof gateway>;

describe('TransactionStore', () => {
  test('Empty Transaction History', () => {
    mockedGateway.getTransactionHistory.mockImplementation(() => {
      const result: TransactionListPage = {
        results: [],
      };
      return Promise.resolve(result);
    });

    const safeProvider = createMockSafeAppProvider({
      allowance: new BigNumber(69),
      decimals: 18,
    });

    fetchApprovalTransactions(safeAddress, 1, safeProvider);
    expect(mockedGateway.getTransactionHistory).toHaveBeenCalledWith('https://safe-client.gnosis.io', '1', safeAddress);
    expect(mockedGateway.getTransactionDetails).not.toHaveBeenCalled();
  });

  /**
   * Single Approve Transaction which gave an Approval of 69.
   * The remaining allowance of this spender / token is 42.
   */
  test('Single Approve Transaction', async () => {
    mockedGateway.getTransactionHistory.mockImplementation(() => {
      const result: TransactionListPage = {
        results: [
          {
            type: 'TRANSACTION',
            conflictType: 'End',
            transaction: {
              id: '1',
              timestamp: 123,
              txInfo: {
                type: 'Custom',
                methodName: 'approve',
                actionCount: null,
                dataSize: '0',
                isCancellation: false,
                to: {
                  value: tokenAddress,
                  logoUri: null,
                  name: 'Dai',
                },
                value: '0',
              },
              txStatus: TransactionStatus.SUCCESS,
            },
          },
        ],
      };
      return Promise.resolve(result);
    });
    mockedGateway.getTransactionDetails.mockImplementation(() => {
      const result: TransactionDetails = {
        txId: '1',
        executedAt: 123,
        txStatus: TransactionStatus.SUCCESS,
        txData: {
          to: {
            value: tokenAddress,
            name: 'Dai',
            logoUri: null,
          },
          value: '0',
          hexData: null,
          addressInfoIndex: null,
          operation: Operation.CALL,
          trustedDelegateCallTarget: true,
          dataDecoded: {
            method: 'approve',
            parameters: [
              { name: 'spender', type: 'address', value: spenderAddress, valueDecoded: null },
              { name: 'value', type: 'uint256', value: toWei(69, 18).toFixed(), valueDecoded: null },
            ],
          },
        },
        safeAppInfo: null,
        txInfo: {
          type: 'Custom',
          methodName: 'approve',
          actionCount: null,
          dataSize: '0',
          isCancellation: false,
          to: {
            value: tokenAddress,
            logoUri: null,
            name: 'Dai',
          },
          value: '0',
        },
        txHash: '0x00001',
        detailedExecutionInfo: null,
      };
      return Promise.resolve(result);
    });

    const safeProvider = createMockSafeAppProvider({
      allowance: new BigNumber(42),
      decimals: 18,
    });

    const approvalsTxs = await fetchApprovalTransactions(safeAddress, 1, safeProvider);
    expect(mockedGateway.getTransactionHistory).toHaveBeenCalledWith('https://safe-client.gnosis.io', '1', safeAddress);
    expect(mockedGateway.getTransactionDetails).toHaveBeenCalledWith('https://safe-client.gnosis.io', '1', '1');

    expect(approvalsTxs).toHaveLength(1);
    expect(approvalsTxs[0].allowance).toBe(toWei(42, 18).toFixed());
    expect(approvalsTxs[0].spender).toBe(spenderAddress);
    expect(approvalsTxs[0].tokenAddress).toBe(tokenAddress);
    expect(approvalsTxs[0].transactions).toHaveLength(1);
    expect(approvalsTxs[0].transactions[0].txHash).toBe('0x00001');
    expect(approvalsTxs[0].transactions[0].executionDate).toBe(123);
    expect(approvalsTxs[0].transactions[0].value).toBe(toWei(69, 18).toFixed());
  });

  /**
   * Single Approve Transaction which gave an Approval of 69.
   * The remaining allowance of this spender / token is 42.
   *
   * Additionally there is a transferFrom transaction, which we ignore.
   */
  test('Single Approve Transaction within two transactions', async () => {
    mockedGateway.getTransactionHistory.mockImplementation(() => {
      const result: TransactionListPage = {
        results: [
          {
            type: 'TRANSACTION',
            conflictType: 'End',
            transaction: {
              id: '1',
              timestamp: 123,
              txInfo: {
                type: 'Custom',
                methodName: 'approve',
                actionCount: null,
                dataSize: '0',
                isCancellation: false,
                to: {
                  value: tokenAddress,
                  logoUri: null,
                  name: 'Dai',
                },
                value: '0',
              },
              txStatus: TransactionStatus.SUCCESS,
            },
          },
          {
            type: 'TRANSACTION',
            conflictType: 'End',
            transaction: {
              id: '2',
              timestamp: 234,
              txInfo: {
                type: 'Custom',
                methodName: 'transferFrom',
                actionCount: null,
                dataSize: '0',
                isCancellation: false,
                to: {
                  value: tokenAddress,
                  logoUri: null,
                  name: 'Dai',
                },
                value: '0',
              },
              txStatus: TransactionStatus.SUCCESS,
            },
          },
        ],
      };
      return Promise.resolve(result);
    });
    mockedGateway.getTransactionDetails.mockImplementation(() => {
      const result: TransactionDetails = {
        txId: '1',
        executedAt: 123,
        txStatus: TransactionStatus.SUCCESS,
        txData: {
          to: {
            value: tokenAddress,
            name: 'Dai',
            logoUri: null,
          },
          value: '0',
          hexData: null,
          addressInfoIndex: null,
          operation: Operation.CALL,
          trustedDelegateCallTarget: true,
          dataDecoded: {
            method: 'approve',
            parameters: [
              { name: 'spender', type: 'address', value: spenderAddress, valueDecoded: null },
              { name: 'value', type: 'uint256', value: toWei(69, 18).toFixed(), valueDecoded: null },
            ],
          },
        },
        safeAppInfo: null,
        txInfo: {
          type: 'Custom',
          methodName: 'approve',
          actionCount: null,
          dataSize: '0',
          isCancellation: false,
          to: {
            value: tokenAddress,
            logoUri: null,
            name: 'Dai',
          },
          value: '0',
        },
        txHash: '0x00001',
        detailedExecutionInfo: null,
      };
      return Promise.resolve(result);
    });

    const safeProvider = createMockSafeAppProvider({
      allowance: new BigNumber(42),
      decimals: 18,
    });

    const approvalsTxs = await fetchApprovalTransactions(safeAddress, 1, safeProvider);
    expect(mockedGateway.getTransactionHistory).toHaveBeenCalledWith('https://safe-client.gnosis.io', '1', safeAddress);
    expect(mockedGateway.getTransactionDetails).toHaveBeenCalledTimes(1);
    expect(mockedGateway.getTransactionDetails).toHaveBeenCalledWith('https://safe-client.gnosis.io', '1', '1');

    expect(approvalsTxs).toHaveLength(1);
    expect(approvalsTxs[0].allowance).toBe(toWei(42, 18).toFixed());
    expect(approvalsTxs[0].spender).toBe(spenderAddress);
    expect(approvalsTxs[0].tokenAddress).toBe(tokenAddress);
    expect(approvalsTxs[0].transactions).toHaveLength(1);
    expect(approvalsTxs[0].transactions[0].txHash).toBe('0x00001');
    expect(approvalsTxs[0].transactions[0].executionDate).toBe(123);
    expect(approvalsTxs[0].transactions[0].value).toBe(toWei(69, 18).toFixed());
  });

  /**
   * Multicall Approve Transaction which gave an Approval of 69 for token1,spender1 and an approval of 0 to token2,spender2.
   * The remaining allowance are 69 and 0
   */
  test('Multicall Approve Transaction', async () => {
    mockedGateway.getTransactionHistory.mockImplementation(() => {
      const result: TransactionListPage = {
        results: [
          {
            type: 'TRANSACTION',
            conflictType: 'End',
            transaction: {
              id: '1',
              timestamp: 123,
              txInfo: {
                type: 'Custom',
                methodName: 'multiSend',
                actionCount: null,
                dataSize: '0',
                isCancellation: false,
                to: {
                  value: mockMultiCallAddress,
                  logoUri: null,
                  name: 'MultiCall',
                },
                value: '0',
              },
              txStatus: TransactionStatus.SUCCESS,
            },
          },
        ],
      };
      return Promise.resolve(result);
    });
    mockedGateway.getTransactionDetails.mockImplementation(() => {
      const result: TransactionDetails = {
        txId: '1',
        executedAt: 123,
        txStatus: TransactionStatus.SUCCESS,
        txData: {
          to: {
            value: tokenAddress,
            name: 'Dai',
            logoUri: null,
          },
          value: '0',
          hexData: null,
          addressInfoIndex: null,
          operation: Operation.CALL,
          trustedDelegateCallTarget: true,
          dataDecoded: {
            method: 'multiSend',
            parameters: [
              {
                name: 'transactions',
                type: 'transactions',
                value: '',
                valueDecoded: [
                  {
                    data: null,
                    dataDecoded: {
                      method: 'approve',
                      parameters: [
                        { name: 'spender', type: 'address', value: spenderAddress, valueDecoded: null },
                        { name: 'value', type: 'uint256', value: toWei(69, 18).toFixed(), valueDecoded: null },
                      ],
                    },
                    to: tokenAddress,
                    operation: Operation.CALL,
                    value: '0',
                  },
                  {
                    data: null,
                    dataDecoded: {
                      method: 'approve',
                      parameters: [
                        { name: 'spender', type: 'address', value: spenderAddress2, valueDecoded: null },
                        { name: 'value', type: 'uint256', value: toWei(0, 18).toFixed(), valueDecoded: null },
                      ],
                    },
                    to: tokenAddress2,
                    operation: Operation.CALL,
                    value: '0',
                  },
                ],
              },
            ],
          },
        },
        safeAppInfo: null,
        txInfo: {
          type: 'Custom',
          methodName: 'approve',
          actionCount: null,
          dataSize: '0',
          isCancellation: false,
          to: {
            value: tokenAddress,
            logoUri: null,
            name: 'Dai',
          },
          value: '0',
        },
        txHash: '0x00001',
        detailedExecutionInfo: null,
      };
      return Promise.resolve(result);
    });

    const safeProvider = createMockSafeAppProvider({
      allowance: new BigNumber(0),
      decimals: 18,
    });

    const approvalsTxs = await fetchApprovalTransactions(safeAddress, 1, safeProvider);
    expect(mockedGateway.getTransactionHistory).toHaveBeenCalledWith('https://safe-client.gnosis.io', '1', safeAddress);
    expect(mockedGateway.getTransactionDetails).toHaveBeenCalledWith('https://safe-client.gnosis.io', '1', '1');

    expect(approvalsTxs).toHaveLength(2);
    expect(approvalsTxs[0].allowance).toBe(toWei(0, 18).toFixed());
    expect(approvalsTxs[0].spender).toBe(spenderAddress);
    expect(approvalsTxs[0].tokenAddress).toBe(tokenAddress);
    expect(approvalsTxs[0].transactions).toHaveLength(1);
    expect(approvalsTxs[0].transactions[0].txHash).toBe('0x00001');
    expect(approvalsTxs[0].transactions[0].executionDate).toBe(123);
    expect(approvalsTxs[0].transactions[0].value).toBe(toWei(69, 18).toFixed());

    expect(approvalsTxs[1].allowance).toBe(toWei(0, 18).toFixed());
    expect(approvalsTxs[1].spender).toBe(spenderAddress2);
    expect(approvalsTxs[1].tokenAddress).toBe(tokenAddress2);
    expect(approvalsTxs[1].transactions).toHaveLength(1);
    expect(approvalsTxs[1].transactions[0].txHash).toBe('0x00001');
    expect(approvalsTxs[1].transactions[0].executionDate).toBe(123);
    expect(approvalsTxs[1].transactions[0].value).toBe(toWei(0, 18).toFixed());
  });
});
