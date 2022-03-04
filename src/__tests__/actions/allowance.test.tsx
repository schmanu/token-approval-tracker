import { SafeAppProvider } from '@gnosis.pm/safe-apps-provider';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';

import { getAllowance } from '../../actions/allowance';
import { UNLIMITED_ALLOWANCE } from '../../constants';
import { ERC20__factory } from '../../contracts';
import { fromWei, toWei } from '../../wei';

const ownerAddress = '0x1000000000000000000000000000000000000000';
const spenderAddress = '0x2000000000000000000000000000000000000000';
const tokenAddress = '0x1230000000000000000000000000000000000000';

const erc20Interface = ERC20__factory.createInterface();

const createMockSafeAppProvider: (returnData: { decimals?: number; allowance?: BigNumber }) => SafeAppProvider = (
  returnData,
) => {
  return {
    request: async (request: { method: string; params?: any[] }) => {
      const { method, params } = request;
      switch (method) {
        case 'eth_chainId':
        case 'net_version':
          return Promise.resolve(1);
        case 'eth_call':
          if (params) {
            const data: string = params[0].data;
            const method = erc20Interface.getFunction(data.slice(0, 10));

            switch (method.name) {
              case 'decimals':
                if (typeof returnData.decimals !== 'undefined') {
                  return Promise.resolve(ethers.utils.defaultAbiCoder.encode(['uint8'], [returnData.decimals]));
                }
                break;
              case 'allowance':
                if (typeof returnData.decimals !== 'undefined' && typeof returnData.allowance !== 'undefined') {
                  return Promise.resolve(
                    ethers.utils.defaultAbiCoder.encode(
                      ['uint256'],
                      [toWei(returnData.allowance, returnData.decimals).toFixed()],
                    ),
                  );
                }
            }
          }
      }
      return Promise.resolve(undefined);
    },
  } as SafeAppProvider;
};

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
