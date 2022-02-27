import { SafeAppProvider } from '@gnosis.pm/safe-apps-provider';
import { BigNumber } from 'bignumber.js';
import { ethers } from 'ethers';

import { ERC20__factory } from '../contracts';

export const getAllowance = async (
  ownerAddress: string,
  tokenAddress: string,
  spenderAddress: string,
  provider: SafeAppProvider,
): Promise<BigNumber | undefined> => {
  const web3 = new ethers.providers.Web3Provider(provider);
  const contract = ERC20__factory.connect(tokenAddress, web3);
  const decimals = await contract.decimals().catch((error) => {
    console.log(`Error while fetching decimals: ${error}`);
    return undefined;
  });
  if (decimals) {
    return await contract
      .allowance(ownerAddress, spenderAddress)
      .then((allowance) => allowance.toString())
      .then((allowance) => new BigNumber(allowance))
      .catch((error) => {
        console.log(`Error while fetching approval: ${error}`);
        return undefined;
      });
  } else {
    console.log(`No decimals found for contract at ${tokenAddress}. Skipping allowance fetching.`);
    return undefined;
  }
};
