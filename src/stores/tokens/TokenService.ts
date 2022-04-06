import { networkInfo } from '../../networks';

export interface TokenInfo {
  type: string;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoUri: string;
}

export const fetchTokenInfo = async (tokenAddress: string, network: number) => {
  const baseAPIURL = networkInfo.get(network)?.baseAPI;

  if (!baseAPIURL) {
    return undefined;
  } else {
    return await fetch(`${baseAPIURL}/tokens/${tokenAddress}/`)
      .then((response: Response) => {
        if (response.ok) {
          return response.json() as Promise<TokenInfo>;
        } else {
          throw Error(response.statusText);
        }
      })
      .catch(() => undefined);
  }
};
