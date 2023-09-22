import { SafeAppProvider } from '@safe-global/safe-apps-provider';
import { BigNumber } from 'bignumber.js';
import { ethers } from 'ethers';

import { ERC20__factory } from '../contracts';

export const getAllowance = async (
  ownerAddress: string,
  tokenAddress: string,
  spenderAddress: string,
  provider: SafeAppProvider,
): Promise<BigNumber | void> => {
  const web3 = new ethers.providers.Web3Provider(provider);
  const contract = ERC20__factory.connect(tokenAddress, web3);
  return await contract
    .allowance(ownerAddress, spenderAddress)
    .then((allowance) => allowance.toString())
    .then((allowance) => new BigNumber(allowance))
    .catch((error) => {
      console.log(`Error while fetching approval: ${error}`);
    });
};
