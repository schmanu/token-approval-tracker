type NetworkInfo = {
  shortName: string;
  chainID: number;
  name: string;
  currencySymbol: string;
  baseAPI?: string;
};

export const networkInfo = new Map<number, NetworkInfo>([
  [
    1,
    {
      chainID: 1,
      name: 'Ethereum',
      shortName: 'eth',
      currencySymbol: 'ETH',
      baseAPI: 'https://safe-transaction-mainnet.safe.global',
    },
  ],
  [
    5,
    {
      chainID: 5,
      name: 'Goerli',
      shortName: 'gor',
      currencySymbol: 'GOR',
      baseAPI: 'https://safe-transaction-goerli.safe.global',
    },
  ],
  [
    10,
    {
      chainID: 10,
      name: 'Optimism',
      shortName: 'oeth',
      currencySymbol: 'OETH',
      baseAPI: 'https://safe-transaction-optimism.safe.global',
    },
  ],
  [
    56,
    {
      chainID: 56,
      name: 'Binance Smart Chain',
      shortName: 'bnb',
      currencySymbol: 'BNB',
      baseAPI: 'https://safe-transaction-bsc.safe.global',
    },
  ],
  [
    100,
    {
      chainID: 100,
      name: 'Gnosis Chain (formerly xDai)',
      shortName: 'xdai', // gno is the offical shortname. gnosis Safe still uses xdai though
      currencySymbol: 'xDAI',
      baseAPI: 'https://safe-transaction-gnosis-chain.safe.global',
    },
  ],
  [
    137,
    {
      chainID: 137,
      name: 'Polygon',
      shortName: 'matic',
      currencySymbol: 'MATIC',
      baseAPI: 'https://safe-transaction-polygon.safe.global',
    },
  ],
  [
    42161,
    {
      chainID: 42161,
      name: 'Arbitrum One',
      shortName: 'arb1',
      currencySymbol: 'AETH',
      baseAPI: 'https://safe-transaction-arbitrum.safe.global',
    },
  ],
  [
    43114,
    {
      chainID: 43114,
      name: 'Avalanche',
      shortName: 'avax',
      currencySymbol: 'AVAX',
      baseAPI: 'https://safe-transaction-avalanche.safe.global',
    },
  ],
]);
