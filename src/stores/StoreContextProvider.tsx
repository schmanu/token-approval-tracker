import { SafeAppProvider } from '@gnosis.pm/safe-apps-provider';
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';
import { observable, reaction } from 'mobx';
import { createContext, ReactElement, useEffect } from 'react';

import { StoreLoader } from '../components/StoreLoader';
import { useSafeServiceClient } from '../hooks/useSafeCoreSdk';

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
    hideRevokedApprovals: false,
    toggleHideRevokedApprovals: () => {},
    filteredApprovals: [],
  },
});

export const StoreContextProvider = (props: {
  children: ReactElement;
  loading: ReactElement;
  stores: { transactionStore: TransactionStore; tokenStore: TokenStore; uiStore: UIStore };
}) => {
  const { safe, sdk } = useSafeAppsSDK();
  const safeServiceCLient = useSafeServiceClient();
  const { transactionStore, tokenStore, uiStore } = props.stores;

  const { fetchApprovals } = transactionStore;
  useEffect(() => {
    fetchApprovals(safe.safeAddress, safe.chainId, new SafeAppProvider(safe, sdk));
  }, [fetchApprovals, safe, sdk]);

  useEffect(() => {
    if (safeServiceCLient) {
      reaction(
        () => transactionStore.approvalTransactions,
        (approvals) => {
          tokenStore.loadTokenInfo(approvals, safeServiceCLient);
        },
      );
    }
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

    // reaction is a reactive function from mobx and will rerender on changes to the stores.
    // calling it twice using useEffect will cause too many reactions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safe.chainId, safeServiceCLient]);

  return (
    <StoreContext.Provider value={{ transactionStore, tokenStore, uiStore }}>
      <StoreLoader {...props} />
    </StoreContext.Provider>
  );
};
