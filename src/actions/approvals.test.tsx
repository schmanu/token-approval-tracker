import { BigNumber } from 'bignumber.js';

import { UNLIMITED_ALLOWANCE } from '../constants';
import { ERC20__factory } from '../contracts';
import { toWei } from '../utils/wei';

import { createApprovals } from './approvals';

const spenderAddress = '0x1000000000000000000000000000000000000000';
const spenderAddress2 = '0x2000000000000000000000000000000000000000';

const tokenAddress = '0x0000000000000000000000000000000000000001';
const tokenAddress2 = '0x0000000000000000000000000000000000000002';

const erc20Interface = ERC20__factory.createInterface();

describe('Create Approvals', () => {
  test('revoke single approval', () => {
    const txs = createApprovals([
      {
        spender: spenderAddress,
        tokenAddress,
        editedAmountInWEI: new BigNumber(0),
      },
    ]);

    expect(txs).toHaveLength(1);
    const tx = txs.pop();
    expect(tx?.to).toBe(tokenAddress);
    expect(tx?.value).toBe('0');
    expect(tx?.data).toBe(erc20Interface.encodeFunctionData('approve', [spenderAddress, 0]));
  });

  test('edit single approval', () => {
    const approvalAmount = toWei(69, 18);
    const txs = createApprovals([
      {
        spender: spenderAddress,
        tokenAddress,
        editedAmountInWEI: approvalAmount,
      },
    ]);

    expect(txs).toHaveLength(1);
    const tx = txs.pop();
    expect(tx?.to).toBe(tokenAddress);
    expect(tx?.value).toBe('0');
    expect(tx?.data).toBe(erc20Interface.encodeFunctionData('approve', [spenderAddress, approvalAmount.toFixed()]));
  });

  test('unlimited approval', () => {
    const txs = createApprovals([
      {
        spender: spenderAddress,
        tokenAddress,
        editedAmountInWEI: UNLIMITED_ALLOWANCE,
      },
    ]);

    expect(txs).toHaveLength(1);
    const tx = txs.pop();
    expect(tx?.to).toBe(tokenAddress);
    expect(tx?.value).toBe('0');
    expect(tx?.data).toBe(
      erc20Interface.encodeFunctionData('approve', [spenderAddress, UNLIMITED_ALLOWANCE.toFixed()]),
    );
  });

  test('revoke multiple approvals', () => {
    const txs = createApprovals([
      {
        spender: spenderAddress,
        tokenAddress,
        editedAmountInWEI: new BigNumber(0),
      },
      {
        spender: spenderAddress,
        tokenAddress: tokenAddress2,
        editedAmountInWEI: new BigNumber(0),
      },
      {
        spender: spenderAddress2,
        tokenAddress,
        editedAmountInWEI: new BigNumber(0),
      },
      {
        spender: spenderAddress2,
        tokenAddress: tokenAddress2,
        editedAmountInWEI: new BigNumber(0),
      },
    ]);

    expect(txs).toHaveLength(4);
    expect(txs).toContainEqual({
      to: tokenAddress,
      value: '0',
      data: erc20Interface.encodeFunctionData('approve', [spenderAddress, 0]),
    });
    expect(txs).toContainEqual({
      to: tokenAddress,
      value: '0',
      data: erc20Interface.encodeFunctionData('approve', [spenderAddress2, 0]),
    });
    expect(txs).toContainEqual({
      to: tokenAddress2,
      value: '0',
      data: erc20Interface.encodeFunctionData('approve', [spenderAddress, 0]),
    });
    expect(txs).toContainEqual({
      to: tokenAddress2,
      value: '0',
      data: erc20Interface.encodeFunctionData('approve', [spenderAddress2, 0]),
    });
  });
});
