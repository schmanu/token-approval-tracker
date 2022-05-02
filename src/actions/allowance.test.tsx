import { BigNumber } from 'bignumber.js';

import { UNLIMITED_ALLOWANCE } from '../constants';
import { createMockSafeAppProvider } from '../testutils/utils';
import { fromWei } from '../utils/wei';

import { getAllowance } from './allowance';

const ownerAddress = '0x1000000000000000000000000000000000000000';
const spenderAddress = '0x2000000000000000000000000000000000000000';
const tokenAddress = '0x1230000000000000000000000000000000000000';

describe('getAllowance()', () => {
  test('Token with 18 decimals', async () => {
    const mockProvider = createMockSafeAppProvider({
      decimals: 18,
      allowance: new BigNumber(69),
    });

    const allowance = await getAllowance(ownerAddress, tokenAddress, spenderAddress, mockProvider);
    expect(allowance).toBeDefined();
    expect(fromWei(allowance as BigNumber, 18).toNumber()).toBe(69);
  });

  test('Token with 0 decimals', async () => {
    const mockProvider = createMockSafeAppProvider({
      decimals: 0,
      allowance: new BigNumber(69),
    });

    const allowance = await getAllowance(ownerAddress, tokenAddress, spenderAddress, mockProvider);
    expect(allowance).toBeDefined();
    expect(allowance?.toNumber()).toBe(69);
  });

  test('Allowance of zero', async () => {
    const mockProvider = createMockSafeAppProvider({
      decimals: 10,
      allowance: new BigNumber(0),
    });

    const allowance = await getAllowance(ownerAddress, tokenAddress, spenderAddress, mockProvider);
    expect(allowance).toBeDefined();
    expect(fromWei(allowance as BigNumber, 10).toNumber()).toBe(0);
  });

  test('Unlimited allowance', async () => {
    const unlimitedAllowanceWithDecimals = fromWei(UNLIMITED_ALLOWANCE, 18);
    const mockProvider = createMockSafeAppProvider({
      decimals: 18,
      allowance: unlimitedAllowanceWithDecimals,
    });

    const allowance = await getAllowance(ownerAddress, tokenAddress, spenderAddress, mockProvider);
    expect(allowance).toBeDefined();
    expect(allowance?.isEqualTo(UNLIMITED_ALLOWANCE)).toBeTruthy();
  });

  test('Invalid token without decimals', async () => {
    const mockProvider = createMockSafeAppProvider({});

    const allowance = await getAllowance(ownerAddress, tokenAddress, spenderAddress, mockProvider);
    expect(allowance).toBeUndefined();
  });
});
