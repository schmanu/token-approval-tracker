import { SafeAppProvider } from '@gnosis.pm/safe-apps-provider';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';

import { ERC20__factory } from '../contracts';
import { toWei } from '../wei';

const erc20Interface = ERC20__factory.createInterface();

export const createMockSafeAppProvider: (returnData: {
  decimals?: number;
  allowance?: BigNumber;
}) => SafeAppProvider = (returnData) => {
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
