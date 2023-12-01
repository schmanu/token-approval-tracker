import SDK, { SafeBalances } from '@safe-global/safe-apps-sdk';
import { action, makeObservable, observable } from 'mobx';

export class BalanceStore {
  isBalanceLoading = true;
  balances: SafeBalances = { fiatTotal: '0', items: [] };

  constructor() {
    makeObservable(this, {
      isBalanceLoading: observable,
      balances: observable,
      loadBalances: action,
      setBalances: action,
    });
  }

  loadBalances = (sdk: SDK) => {
    sdk.safe.experimental_getBalances().then((balances) => {
      this.setBalances(balances);
    });
  };

  setBalances = (balances: SafeBalances) => {
    this.balances = balances;
  };
}
