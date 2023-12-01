import { SafeAppProvider } from '@safe-global/safe-apps-provider';
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk';
import { observable, reaction } from 'mobx';
import { createContext, ReactElement, useContext, useEffect } from 'react';

import { StoreLoader } from '../components/StoreLoader';
import { useSafeServiceClient } from '../hooks/useSafeCoreSdk';

import { BalanceStore } from './tokens/BalanceStore';
import { TokenStore } from './tokens/TokenStore';
import { TransactionStore } from './transactions/TransactionStore';
import { UIApprovalEntry, UIStore } from './ui/UIStore';

export const StoreContext = createContext<{
  transactionStore: TransactionStore;
  tokenStore: TokenStore;
  uiStore: UIStore;
  balanceStore: BalanceStore;
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
    balances: observable({ fiatTotal: '', items: [] }),
    setApprovals: () => {},
    setBalances: () => {},
    allSelected: false,
    selectAll: () => {},
    selectedApprovals: [],
    hideRevokedApprovals: true,
    hideZeroBalances: false,
    toggleHideRevokedApprovals: () => {},
    toggleHideZeroBalances: () => {},
    filteredApprovals: [],
  },
  balanceStore: {
    balances: { fiatTotal: '', items: [] },
    isBalanceLoading: true,
    loadBalances: () => {},
    setBalances: () => {},
  },
});

export const StoreContextProvider = (props: {
  children: ReactElement;
  loading: ReactElement;
  stores: { transactionStore: TransactionStore; tokenStore: TokenStore; uiStore: UIStore; balanceStore: BalanceStore };
}) => {
  const { safe, sdk } = useSafeAppsSDK();
  const safeServiceCLient = useSafeServiceClient();
  const { transactionStore, tokenStore, uiStore, balanceStore } = props.stores;

  const { fetchApprovals } = transactionStore;
  const { loadBalances } = balanceStore;
  useEffect(() => {
    fetchApprovals(safe.safeAddress, safe.chainId, new SafeAppProvider(safe, sdk));
    loadBalances(sdk);
  }, [fetchApprovals, loadBalances, safe, sdk]);

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

    reaction(
      () => balanceStore.balances,
      (balances) => {
        uiStore.setBalances(balances);
      },
    );

    // reaction is a reactive function from mobx and will rerender on changes to the stores.
    // calling it twice using useEffect will cause too many reactions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safe.chainId, safeServiceCLient]);

  return (
    <StoreContext.Provider value={{ transactionStore, tokenStore, uiStore, balanceStore }}>
      <StoreLoader {...props} />
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
