import { SafeAppProvider } from '@gnosis.pm/safe-apps-provider';
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';
import React, { ReactElement, useContext, useEffect, useState } from 'react';

import { getAllowance } from '../actions/allowance';
import { networkInfo } from '../networks';

interface Transaction {
  safe: string;
  to: string;
  transactionHash: string;
  executionDate: string;
  dataDecoded?: {
    method: string;
    parameters: Array<{
      name: string;
      type: string;
      value: string;
      valueDecoded?: {
        operation: number;
        to: string;
        value: string;
        data: string;
        dataDecoded?: {
          method: string;
          parameters: {
            name: string;
            type: string;
            value: string;
          }[];
        };
      }[];
    }>;
  };
}

export interface TokenInfo {
  type: string;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoUri: string;
}

export interface AccumulatedApproval {
  tokenAddress: string;
  spender: string;
  allowance: string;
  transactions: { executionDate: string; value?: string; txHash: string }[];
}

interface TransactionData {
  isLoading: boolean;
  approvalTransactions?: AccumulatedApproval[];
  tokenInfoMap: Map<string, TokenInfo>;
}

const TransactionDataContext = React.createContext<TransactionData>({
  isLoading: true,
  approvalTransactions: new Array<AccumulatedApproval>(),
  tokenInfoMap: new Map<string, TokenInfo>(),
});

export const TransactionDataContextProvider = (props: { children: ReactElement; loading: ReactElement }) => {
  const { safe, sdk } = useSafeAppsSDK();
  const [isApprovalLoading, setisApprovalLoading] = useState(false);
  const [isTokenInfoLoading, setisTokenInfoLoading] = useState(false);
  const [approvalTransactions, setApprovalTransactions] = useState<AccumulatedApproval[] | undefined>(undefined);
  const [tokenInfoMap, setTokenInfoMap] = useState<Map<string, TokenInfo>>(new Map<string, TokenInfo>());

  useEffect(() => {
    let isMounted = true;
    setisApprovalLoading(true);

    fetchApprovalTransactions(safe.safeAddress, safe.chainId, new SafeAppProvider(safe, sdk))
      .then((approvals) => {
        if (isMounted) {
          setApprovalTransactions(approvals);
          setisApprovalLoading(false);
        }
      })
      .catch(() => isMounted ?? setisApprovalLoading(false));

    const callback = () => {
      isMounted = false;
    };
    return callback;
  }, [safe, sdk]);

  useEffect(() => {
    let isMounted = true;
    if (approvalTransactions) {
      setisTokenInfoLoading(true);
      const promisedTokens = approvalTransactions.map((approval) =>
        fetchTokenInfo(approval.tokenAddress, safe.chainId),
      );
      Promise.all(promisedTokens)
        .then((tokenResults) => {
          const entries: [string, TokenInfo][] = (
            tokenResults.filter((result) => typeof result !== 'undefined') as TokenInfo[]
          ).map((result) => [result.address, result]);
          if (isMounted) {
            setTokenInfoMap(new Map<string, TokenInfo>(entries));
            setisTokenInfoLoading(false);
          }
        })
        .catch(() => isMounted ?? setisTokenInfoLoading(false));
    }

    const callback = () => {
      isMounted = false;
    };
    return callback;
  }, [approvalTransactions, safe.chainId]);

  return (
    <TransactionDataContext.Provider
      value={{
        isLoading: isApprovalLoading || isTokenInfoLoading,
        approvalTransactions,
        tokenInfoMap,
      }}
    >
      {isApprovalLoading || isTokenInfoLoading ? props.loading : props.children}
    </TransactionDataContext.Provider>
  );
};

export const useApprovalTransactions = () => {
  const { isLoading, approvalTransactions } = useContext(TransactionDataContext);
  if (!isLoading) {
    return approvalTransactions;
  } else {
    return undefined;
  }
};

export const useTokenList = () => {
  const { isLoading, tokenInfoMap } = useContext(TransactionDataContext);
  if (!isLoading) {
    return tokenInfoMap;
  } else {
    return undefined;
  }
};

const containsApproveTransaction = (tx: Transaction) => {
  const containsApproval =
    'approve' === tx.dataDecoded?.method ||
    ('multiSend' === tx.dataDecoded?.method &&
      (tx.dataDecoded.parameters
        .find((param) => param.name === 'transactions')
        ?.valueDecoded?.some((value) => value.dataDecoded?.method === 'approve') ??
        false));
  console.log('Check DOne');
  return containsApproval;
};

const unpackApprovalTransactions = (tx: Transaction) => {
  const txs: Transaction[] = [];
  if ('approve' === tx.dataDecoded?.method) {
    txs.push(tx);
  } else {
    console.log('Trying to unpack multisend tx: ' + tx);
    tx.dataDecoded?.parameters
      .find((param) => param.name === 'transactions')
      ?.valueDecoded?.forEach((innerTx) => {
        if (innerTx.dataDecoded?.method === 'approve') {
          txs.push({
            executionDate: tx.executionDate,
            safe: tx.safe,
            to: innerTx.to,
            transactionHash: tx.transactionHash,
            dataDecoded: innerTx.dataDecoded,
          });
        }
      });
  }

  return txs;
};

const fetchApprovalTransactions = async (
  safeAddress: string,
  network: number,
  safeAppProvider: SafeAppProvider,
  offset: number = 0,
) => {
  const baseAPIURL = networkInfo.get(network)?.baseAPI;

  if (!baseAPIURL) {
    return [] as AccumulatedApproval[];
  } else {
    return await fetch(
      `${baseAPIURL}/safes/${safeAddress}/all-transactions/?executed=true&queued=false&offset=${offset}`,
    )
      .then((response: Response) => {
        if (response.ok) {
          return response.json() as Promise<{ results: Transaction[] }>;
        } else {
          throw Error(response.statusText);
        }
      })
      .then((response) => response.results)
      .then((response) => response.filter(containsApproveTransaction))
      .then((response) => response.flatMap(unpackApprovalTransactions))
      .then((response) => reduceToMap(response, (obj: Transaction) => obj.to))
      .then(async (approvalMap) => {
        const result: AccumulatedApproval[] = [];
        for (const tokenEntry of approvalMap.entries()) {
          const transactionsBySpender = reduceToMap(tokenEntry[1], (tx) => {
            const spender = tx.dataDecoded?.parameters.find((param) => param.name === 'spender')?.value;
            if (!spender) {
              throw Error('Approvals without spender');
            }
            return spender;
          });

          for (const spenderEntry of transactionsBySpender.entries()) {
            const allowance = await getAllowance(safeAddress, tokenEntry[0], spenderEntry[0], safeAppProvider);
            if (typeof allowance !== 'undefined') {
              result.push({
                spender: spenderEntry[0],
                tokenAddress: tokenEntry[0],
                allowance: allowance.toFixed(),
                transactions: spenderEntry[1].map((tx) => ({
                  executionDate: tx.executionDate,
                  txHash: tx.transactionHash,
                  value: tx.dataDecoded?.parameters.find((param) => param.name === 'value')?.value,
                })),
              });
            }
          }
        }
        return result;
      })
      .catch(() => [] as AccumulatedApproval[]);
  }
};

function reduceToMap<T, K extends string | number>(list: Array<T>, keyFunc: (value: T) => K) {
  return list.reduce((prev, curr) => {
    const key = keyFunc(curr);
    prev.has(key) ? prev.get(key)?.push(curr) : prev.set(key, [curr]);
    return prev;
  }, new Map<K, T[]>());
}

const fetchTokenInfo = async (tokenAddress: string, network: number) => {
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
