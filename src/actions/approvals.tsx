import { BaseTransaction } from '@gnosis.pm/safe-apps-sdk';

import { ERC20__factory } from '../contracts';
import { UIApprovalEntry } from '../stores/ui/UIStore';

type ApprovalChange = Pick<UIApprovalEntry, 'tokenAddress' | 'spender' | 'editedAmountInWEI'>;

export const createApprovals = (approvals: ApprovalChange[]): BaseTransaction[] => {
  const erc20Interface = ERC20__factory.createInterface();
  const txList = approvals.map((approval) => ({
    to: approval.tokenAddress,
    value: '0',
    data: erc20Interface.encodeFunctionData('approve', [approval.spender, approval.editedAmountInWEI.toFixed()]),
  }));
  return txList;
};
