import { SafeAppProvider } from '@gnosis.pm/safe-apps-provider';
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';
import { observable, reaction } from 'mobx';
import { createContext, ReactElement, useEffect } from 'react';

import { StoreLoader } from '../components/StoreLoader';

import { TokenStore } from './tokens/TokenStore';
import { TransactionStore } from './transactions/TransactionStore';
import { UIApprovalEntry, UIStore } from './ui/UIStore';

export const StoreContext = createContext<{
  transactionStore: TransactionStore;
  tokenStore: TokenStore;
  uiStore: UIStore;
}>({
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
  uiStore: {
    approvals: observable([]),
    setApprovals: () => {},
    allSelected: false,
    selectAll: () => {},
    selectedApprovals: [],
  },
});

export const StoreContextProvider = (props: {
  children: ReactElement;
  loading: ReactElement;
  stores: { transactionStore: TransactionStore; tokenStore: TokenStore; uiStore: UIStore };
}) => {
  const { safe, sdk } = useSafeAppsSDK();
  const { transactionStore, tokenStore, uiStore } = props.stores;

  const { fetchApprovals } = transactionStore;
  useEffect(() => {
    fetchApprovals(safe.safeAddress, safe.chainId, new SafeAppProvider(safe, sdk));
  }, [fetchApprovals, safe, sdk]);

  reaction(
    () => transactionStore.approvalTransactions,
    (approvals) => {
      tokenStore.loadTokenInfo(approvals, safe.chainId);
    },
  );

  reaction(
    () => ({ tokenInfoMap: tokenStore.tokenInfoMap, approvalTransactions: transactionStore.approvalTransactions }),
    (data) => {
      const { tokenInfoMap, approvalTransactions } = data;
      const uiApprovals = approvalTransactions
        .map((approval) => {
          const decimals = tokenInfoMap.get(approval.tokenAddress)?.decimals;
          if (typeof decimals !== 'undefined') {
            return new UIApprovalEntry(approval, decimals);
          }
          return undefined;
        })
        .filter((value) => typeof value !== 'undefined') as UIApprovalEntry[];
      uiStore.setApprovals(uiApprovals);
    },
  );

  return (
    <StoreContext.Provider value={{ transactionStore, tokenStore, uiStore }}>
      <StoreLoader {...props} />
    </StoreContext.Provider>
  );
};
