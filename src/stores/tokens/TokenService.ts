import SafeServiceClient from '@gnosis.pm/safe-service-client';

export const fetchTokenInfo = async (tokenAddress: string, safeServiceClient: SafeServiceClient) => {
  if (!safeServiceClient) {
    return undefined;
  } else {
    return await safeServiceClient.getToken(tokenAddress).catch((reason) => {
      console.error(reason);
      return undefined;
    });
  }
};
