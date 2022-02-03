import { BaseTransaction } from '@gnosis.pm/safe-apps-sdk';
import { BigNumber } from 'bignumber.js';

import { ERC20__factory } from '../contracts';
import { toWei } from '../wei';

export type ApprovalEdit = {
  tokenAddress: string;
  spenderAddress: string;
  newValue: BigNumber;
};

export const createApprovals = (approvals: ApprovalEdit[]): BaseTransaction[] => {
  const erc20Interface = ERC20__factory.createInterface();
  const txList = approvals.map((approval) => ({
    to: approval.tokenAddress,
    value: '0',
    data: erc20Interface.encodeFunctionData('approve', [
      approval.spenderAddress,
      toWei(approval.newValue, 18).toFixed(),
    ]),
  }));
  return txList;
};
