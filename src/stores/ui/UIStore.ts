import { SafeBalances } from '@safe-global/safe-apps-sdk';
import BigNumber from 'bignumber.js';
import { action, computed, makeObservable, observable } from 'mobx';

import { UNLIMITED_ALLOWANCE } from '../../constants';
import { fromWei, toWei } from '../../utils/wei';
import { AccumulatedApproval } from '../transactions/TransactionStore';

export class UIApprovalEntry {
  tokenAddress: string;
  spender: string;
  /* The currently given approval*/
  currentAmount: BigNumber;
  /* The approval edited by the user */
  editedAmount: string;
  inputMode: 'custom' | 'unlimited' | 'revoke';
  selected: boolean;
  decimals: number;

  constructor(approval: AccumulatedApproval, decimals: number) {
    this.tokenAddress = approval.tokenAddress;
    this.spender = approval.spender;
    this.currentAmount = fromWei(new BigNumber(approval.allowance), decimals);
    this.editedAmount = '0';
    this.selected = false;
    this.decimals = decimals;
    this.inputMode = 'revoke';

    makeObservable(this, {
      tokenAddress: observable,
      spender: observable,
      currentAmount: observable,
      editedAmount: observable,
      selected: observable,
      inputMode: observable,
      id: computed,
      toggleSelected: action,
      setSelected: action,
      setEditedAmount: action,
      setInputMode: action,
      currentAmountInWEI: computed,
      editedAmountInWEI: computed,
    });
  }

  get id() {
    return this.tokenAddress + this.spender;
  }

  get currentAmountInWEI() {
    return toWei(this.currentAmount, this.decimals);
  }

  get editedAmountInWEI() {
    return toWei(this.editedAmount, this.decimals);
  }

  toggleSelected = () => {
    this.selected = !this.selected;
  };

  setSelected = (selected: boolean) => {
    this.selected = selected;
  };

  setEditedAmount = (editedAmount: string) => {
    this.editedAmount = editedAmount;
  };

  setInputMode = (inputMode: string) => {
    if (isValidInputMode(inputMode)) {
      this.inputMode = inputMode;
      switch (inputMode) {
        case 'custom':
          break;
        case 'revoke':
          this.editedAmount = '0';
          break;
        case 'unlimited':
          this.editedAmount = fromWei(UNLIMITED_ALLOWANCE, this.decimals).toFixed();
          break;
      }
    }
  };
}

export class UIStore {
  readonly approvals = observable<UIApprovalEntry>([]);
  balances = observable<SafeBalances>({ fiatTotal: '', items: [] });

  hideRevokedApprovals: boolean;
  hideZeroBalances: boolean;

  constructor() {
    this.hideRevokedApprovals = true;
    this.hideZeroBalances = false;

    makeObservable(this, {
      approvals: observable,
      balances: observable,
      hideRevokedApprovals: observable,
      hideZeroBalances: observable,
      setApprovals: action,
      setBalances: action,
      toggleHideRevokedApprovals: action,
      toggleHideZeroBalances: action,
      allSelected: computed,
      selectedApprovals: computed,
      filteredApprovals: computed,
    });
  }

  setApprovals = (newApprovals: UIApprovalEntry[]) => {
    this.approvals.replace(newApprovals);
  };

  setBalances = (newBalances: SafeBalances) => {
    this.balances = newBalances;
  };

  toggleHideRevokedApprovals = () => {
    this.hideRevokedApprovals = !this.hideRevokedApprovals;
  };

  toggleHideZeroBalances = () => {
    this.hideZeroBalances = !this.hideZeroBalances;
  };

  get allSelected() {
    return !this.filteredApprovals.some((value) => !value.selected);
  }

  get filteredApprovals() {
    let result = [...this.approvals];
    if (this.hideRevokedApprovals) {
      result = result.filter((approval) => !approval.currentAmount.isZero());
    }

    if (this.hideZeroBalances) {
      result = result.filter((approval) =>
        this.balances.items.find((item) => item.tokenInfo.address === approval.tokenAddress && item.balance !== '0'),
      );
    }

    return result;
  }

  get selectedApprovals() {
    return this.approvals.filter((approval) => approval.selected);
  }

  selectAll = (selected: boolean) => {
    this.filteredApprovals.forEach((approval) => {
      approval.setSelected(selected);
    });
  };
}

const isValidInputMode = (mode: string): mode is 'custom' | 'unlimited' | 'revoke' => {
  return mode === 'custom' || mode === 'unlimited' || mode === 'revoke';
};
