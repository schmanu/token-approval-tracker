import { SafeAppProvider } from '@gnosis.pm/safe-apps-provider';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';

import { getAllowance } from '../../actions/allowance';
import { ERC20__factory } from '../../contracts';
import { fromWei, toWei } from '../../wei';

const ownerAddress = '0x1000000000000000000000000000000000000000';
const spenderAddress = '0x2000000000000000000000000000000000000000';
const tokenAddress = '0x1230000000000000000000000000000000000000';

const erc20Interface = ERC20__factory.createInterface();

describe('getAllowance()', () => {
  test('Token with 18 decimals', async () => {
    const mockProvider: SafeAppProvider = {
      request: async (request: { method: string; params?: any[] }) => {
        console.log('Request called with: ' + request.method + ' and params: ' + JSON.stringify(request.params));
        const { method, params } = request;
        switch (method) {
          case 'eth_chainId':
          case 'net_version':
            return Promise.resolve(1);
          case 'eth_call':
            if (params) {
              const data: string = params[0].data;
              const method = erc20Interface.getFunction(data.slice(0, 10));
              console.log('ERC20 Call of method ' + method.name);

              switch (method.name) {
                case 'decimals':
                  return Promise.resolve(ethers.utils.defaultAbiCoder.encode(['uint8'], [18]));
                case 'allowance':
                  return Promise.resolve(ethers.utils.defaultAbiCoder.encode(['uint256'], [toWei(69, 18).toFixed()]));
              }
            }
        }
        return Promise.resolve(undefined);
      },
    } as SafeAppProvider;

    const allowance = await getAllowance(ownerAddress, tokenAddress, spenderAddress, mockProvider);
    expect(allowance).toBeDefined();
    expect(fromWei(allowance as BigNumber, 18).toNumber()).toBe(69);
  });
});
