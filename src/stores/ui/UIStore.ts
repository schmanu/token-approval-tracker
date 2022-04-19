import BigNumber from 'bignumber.js';
import { action, computed, makeObservable, observable } from 'mobx';

import { UNLIMITED_ALLOWANCE } from '../../constants';
import { fromWei, toWei } from '../../wei';
import { AccumulatedApproval, Transaction } from '../transactions/TransactionStore';

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
  transactions: Transaction[];

  constructor(approval: AccumulatedApproval, decimals: number) {
    this.tokenAddress = approval.tokenAddress;
    this.spender = approval.spender;
    this.currentAmount = fromWei(new BigNumber(approval.allowance), decimals);
    this.editedAmount = '0';
    this.selected = false;
    this.decimals = decimals;
    this.transactions = approval.transactions;
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

  setInputMode = (inputMode: 'custom' | 'unlimited' | 'revoke') => {
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
  };
}

export class UIStore {
  readonly approvals = observable<UIApprovalEntry>([]);

  constructor() {
    makeObservable(this, {
      approvals: observable,
      setApprovals: action,
      allSelected: computed,
      selectedApprovals: computed,
    });
  }

  setApprovals = (newApprovals: UIApprovalEntry[]) => {
    this.approvals.replace(newApprovals);
  };

  get allSelected() {
    return !this.approvals.some((value) => !value.selected);
  }

  get selectedApprovals() {
    return this.approvals.filter((approval) => approval.selected);
  }

  selectAll = (selected: boolean) => {
    this.approvals.forEach((approval) => {
      approval.setSelected(selected);
    });
  };
}
