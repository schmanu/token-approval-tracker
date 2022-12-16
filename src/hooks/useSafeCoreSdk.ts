import { SafeAppProvider } from '@gnosis.pm/safe-apps-provider';
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';
import EthersAdapter from '@safe-global/safe-ethers-lib';
import SafeServiceClient from '@safe-global/safe-service-client';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

import { networkInfo } from '../networks';

export const useSafeServiceClient = () => {
  const { safe, sdk } = useSafeAppsSDK();

  const [safeServiceClient, setSafeServiceClient] = useState<SafeServiceClient | undefined>();

  useEffect(() => {
    const ethersProvider = new ethers.providers.Web3Provider(new SafeAppProvider(safe, sdk));
    const signer = ethersProvider.getSigner(0);
    const ethersAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: signer,
    });

    const txServiceUrl = networkInfo.get(safe.chainId)?.baseAPI;

    if (txServiceUrl) {
      setSafeServiceClient(
        new SafeServiceClient({
          txServiceUrl: txServiceUrl,
          ethAdapter: ethersAdapter,
        }),
      );
    }
  }, [safe, sdk]);

  return safeServiceClient;
};
