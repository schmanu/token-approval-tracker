import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';
import { Button, EthHashInfo, GenericModal, TextFieldInput, Text, Checkbox } from '@gnosis.pm/safe-react-components';
import BigNumber from 'bignumber.js';
import { useCallback, useState } from 'react';
import styled from 'styled-components';

import { createApprovals } from '../actions/approvals';
import { fromWei, toWei } from '../wei';

import { ApprovalEntry } from './ApprovalList';
import { useTokenList } from './TransactionDataContext';

interface EditableApprovalEntry {
  amount: string;
  spenderAddress: string;
  tokenAddress: string;
  originalAmount: string;
}

type ApprovalDialogProps = {
  approvals: ApprovalEntry[];
  onCancel: () => void;
};

const UNLIMITED_ALLOWANCE = new BigNumber(
  '115792089237316195423570985008687907853269984665640564039457584007913129639935',
);

const ColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 3fr 3fr 3fr;
  width: 100%;
`;

const FlexRowWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

export const ApprovalDialog = (props: ApprovalDialogProps) => {
  const tokenMap = useTokenList();
  const { approvals } = props;

  const [success, setSuccess] = useState(false);

  const [approvalEntries, setApprovalEntries] = useState<EditableApprovalEntry[]>(
    approvals
      .sort((a, b) => a.listPosition - b.listPosition)
      .map((approval) => ({
        amount: approval.amount.toFixed(),
        originalAmount: approval.amount.toFixed(),
        spenderAddress: approval.spender,
        tokenAddress: approval.tokenAddress,
      })),
  );

  const { sdk } = useSafeAppsSDK();

  // Convert props to proper data structure

  const submitDialog = useCallback(async () => {
    const txs = createApprovals(
      approvalEntries.map((entry) => {
        const tokenInfo = tokenMap?.get(entry.tokenAddress);
        if (!tokenInfo) {
          throw new Error(`No TokenInfo found for token with address: ${entry.tokenAddress}`);
        } else {
          return {
            newValue: new BigNumber(entry.amount),
            spenderAddress: entry.spenderAddress,
            tokenInfo: tokenInfo,
          };
        }
      }),
    );
    const response = await sdk.txs.send({ txs: txs }).catch(() => undefined);
    if (response?.safeTxHash) {
      setSuccess(true);
    }
  }, [approvalEntries, sdk.txs, tokenMap]);

  return (
    <GenericModal
      onClose={props.onCancel}
      title="Edit / Revoke Approvals"
      body={
        <div>
          {!success ? (
            <div>
              {approvalEntries.map((approval) => {
                const decimals = tokenMap?.get(approval.tokenAddress)?.decimals ?? 18;
                const amountInDecimals = new BigNumber(approval.amount);
                return (
                  <ColumnGrid>
                    <FlexRowWrapper>
                      <img
                        src={tokenMap?.get(approval.tokenAddress)?.logoUri}
                        width={24}
                        height={24}
                        alt={tokenMap?.get(approval.tokenAddress)?.symbol}
                      />
                      <EthHashInfo hash={approval.tokenAddress} shortenHash={4} showCopyBtn />
                    </FlexRowWrapper>
                    <FlexRowWrapper>
                      <EthHashInfo hash={approval.spenderAddress} shortenHash={4} showCopyBtn />
                    </FlexRowWrapper>
                    <FlexRowWrapper>
                      <Checkbox
                        checked={UNLIMITED_ALLOWANCE.isEqualTo(toWei(approval.amount, decimals))}
                        label="No Limit"
                        name="unlimited"
                        onChange={(event, checked) => {
                          const newAmount = checked
                            ? fromWei(UNLIMITED_ALLOWANCE, decimals).toFixed()
                            : UNLIMITED_ALLOWANCE.isEqualTo(toWei(approval.originalAmount, decimals))
                            ? '0'
                            : approval.originalAmount;
                          setApprovalEntries(
                            approvalEntries.map((approvalEntry) =>
                              approvalEntry.tokenAddress === approval.tokenAddress &&
                              approvalEntry.spenderAddress === approval.spenderAddress
                                ? { ...approvalEntry, amount: newAmount }
                                : approvalEntry,
                            ),
                          );
                        }}
                      />
                      <TextFieldInput
                        name="amount"
                        inputMode="decimal"
                        placeholder="Amount"
                        label="Approval Amount"
                        variant="standard"
                        value={approval.amount}
                        error={amountInDecimals.isNaN() ? 'The value must be a number!' : undefined}
                        onChange={(event) => {
                          const newValue = event.target.value;
                          setApprovalEntries(
                            approvalEntries.map((approvalEntry) =>
                              approvalEntry.tokenAddress === approval.tokenAddress &&
                              approvalEntry.spenderAddress === approval.spenderAddress
                                ? { ...approvalEntry, amount: newValue }
                                : approvalEntry,
                            ),
                          );
                        }}
                      ></TextFieldInput>
                    </FlexRowWrapper>
                  </ColumnGrid>
                );
              })}
              <Button size="md" onClick={submitDialog}>
                Submit
              </Button>
            </div>
          ) : (
            <Text size="xl">Transaction submitted. Check your transactions queue.</Text>
          )}
        </div>
      }
      {...props}
    ></GenericModal>
  );
};
