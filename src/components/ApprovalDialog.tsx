import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';
import { Button, EthHashInfo, GenericModal, TextFieldInput, Text } from '@gnosis.pm/safe-react-components';
import BigNumber from 'bignumber.js';
import { useCallback, useState } from 'react';
import styled from 'styled-components';

import { createApprovals } from '../actions/approvals';

import { ApprovalEntry } from './ApprovalList';
import { useTokenList } from './TransactionDataContext';

interface EditableApprovalEntry {
  amount: string;
  spenderAddress: string;
  tokenAddress: string;
}

type ApprovalDialogProps = {
  approvals: ApprovalEntry[];
  onCancel: () => void;
};

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
  const [error, setError] = useState('');

  const [approvalEntries, setApprovalEntries] = useState<EditableApprovalEntry[]>(
    approvals.map((approval) => ({
      amount: approval.amount.toFixed(),
      spenderAddress: approval.spender,
      tokenAddress: approval.tokenAddress,
    })),
  );

  const { sdk } = useSafeAppsSDK();

  // Convert props to proper data structure

  const submitDialog = useCallback(async () => {
    const txs = createApprovals(
      approvalEntries.map((entry) => ({
        newValue: new BigNumber(entry.amount),
        spenderAddress: entry.spenderAddress,
        tokenAddress: entry.tokenAddress,
      })),
    );
    const response = await sdk.txs.send({ txs: txs }).catch(() => undefined);
    if (response?.safeTxHash) {
      setSuccess(true);
    } else {
      setError('Tx could not be sent.');
    }
  }, [approvalEntries, sdk.txs]);

  return (
    <GenericModal
      onClose={props.onCancel}
      title="Edit / Revoke Approvals"
      body={
        <div>
          {!success && !error ? (
            approvalEntries.map((approval) => {
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
                </ColumnGrid>
              );
            })
          ) : success ? (
            <Text size="xl">Transaction submitted.</Text>
          ) : (
            <Text size="xl">Error while sending transaction</Text>
          )}
          <Button size="md" onClick={submitDialog}>
            Submit
          </Button>
        </div>
      }
      {...props}
    ></GenericModal>
  );
};
