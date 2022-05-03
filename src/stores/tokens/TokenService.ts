import { networkInfo } from '../../networks';

import { TokenInfo } from './TokenStore';

// Our lint rules require return types to always be specified.
export const fetchTokenInfo = async (tokenAddress: string, network: number): Promise<TokenInfo | void> => {
  const baseAPIURL = networkInfo.get(network)?.baseAPI;

  if (!baseAPIURL) {
    return undefined;
  }

  return await fetch(`${baseAPIURL}/tokens/${tokenAddress}/`)
    .then((response: Response) => {
      if (response.ok) {
        // I would recommend creating a type guard here instead of casting, just to be on the safe side, i.e.
        // (val): val is TokenInfo =>
        return response.json() as Promise<TokenInfo>;
      }
      throw Error(response.statusText);
    })
    .catch(() => {
      return;
    });
};
