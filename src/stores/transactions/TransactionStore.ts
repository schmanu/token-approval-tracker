import { SafeAppProvider } from '@gnosis.pm/safe-apps-provider';
import { action, makeObservable, observable } from 'mobx';

import { AccumulatedApproval } from '../../components/TransactionDataContext';

import { fetchApprovalTransactions } from './TransactionService';

export class TransactionStore {
  isTransactionDataLoading = true;
  approvalTransactions = [] as AccumulatedApproval[];

  constructor() {
    makeObservable(this, {
      setApprovalTransactions: action,
      fetchApprovals: action,
      isTransactionDataLoading: observable,
      approvalTransactions: observable,
    });
  }

  fetchApprovals = (safeAddress: string, chainId: number, web3Provider: SafeAppProvider) => {
    console.log('fetchApprovals');

    fetchApprovalTransactions(safeAddress, chainId, web3Provider)
      .then((approvals) => this.setApprovalTransactions(approvals))
      .catch(() => this.setApprovalTransactions([]));
  };

  setApprovalTransactions = (approvals: AccumulatedApproval[]) => {
    this.approvalTransactions = approvals;
    this.isTransactionDataLoading = false;
  };
}
