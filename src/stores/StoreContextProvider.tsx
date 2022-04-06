import { SafeAppProvider } from '@gnosis.pm/safe-apps-provider';
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';
import { reaction } from 'mobx';
import { observer } from 'mobx-react';
import { createContext, ReactElement, useEffect, useState } from 'react';

import { TokenStore } from './tokens/TokenStore';
import { TransactionStore } from './transactions/TransactionStore';

export const StoreContext = createContext<{ transactionStore: TransactionStore; tokenStore: TokenStore }>({
  transactionStore: {
    approvalTransactions: [],
    fetchApprovals: () => {},
    isTransactionDataLoading: true,
    setApprovalTransactions: (approvals) => {},
  },
  tokenStore: {
    isTokenDataLoading: true,
    loadTokenInfo: (approvals) => {},
    setTokenInfo: (map) => {},
    tokenInfoMap: new Map(),
  },
});

export const StoreContextProvider = observer((props: { children: ReactElement; loading: ReactElement }) => {
  const { safe, sdk } = useSafeAppsSDK();
  const [transactionStore] = useState(new TransactionStore());

  const [tokenStore] = useState(new TokenStore());

  const { fetchApprovals } = transactionStore;
  const { loadTokenInfo } = tokenStore;

  useEffect(() => {
    fetchApprovals(safe.safeAddress, safe.chainId, new SafeAppProvider(safe, sdk));
  }, [fetchApprovals, safe, sdk]);

  reaction(
    () => transactionStore.approvalTransactions,
    (approvals) => {
      console.log('Reacting to approval changes!');
      loadTokenInfo(approvals, safe.chainId);
    },
  );

  return (
    <StoreContext.Provider value={{ transactionStore, tokenStore }}>
      {transactionStore.isTransactionDataLoading || tokenStore.isTokenDataLoading ? props.loading : props.children}
    </StoreContext.Provider>
  );
});
