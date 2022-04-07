import { SafeAppProvider } from '@gnosis.pm/safe-apps-provider';
import { action, makeObservable, observable } from 'mobx';

import { fetchApprovalTransactions } from './TransactionService';

export interface AccumulatedApproval {
  tokenAddress: string;
  spender: string;
  allowance: string;
  transactions: { executionDate: string; value?: string; txHash: string }[];
}

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
    fetchApprovalTransactions(safeAddress, chainId, web3Provider)
      .then((approvals) => this.setApprovalTransactions(approvals))
      .catch(() => this.setApprovalTransactions([]));
  };

  setApprovalTransactions = (approvals: AccumulatedApproval[]) => {
    this.approvalTransactions = approvals;
    this.isTransactionDataLoading = false;
  };
}
