import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';
import { Button, EthHashInfo, GenericModal, TextFieldInput, Text, Select } from '@gnosis.pm/safe-react-components';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react';
import { useCallback, useContext, useState } from 'react';
import styled from 'styled-components';

import { createApprovals } from '../actions/approvals';
import { StoreContext } from '../stores/StoreContextProvider';

type ApprovalDialogProps = {
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

export const ApprovalDialog = observer((props: ApprovalDialogProps) => {
  const { tokenStore, uiStore } = useContext(StoreContext);
  const tokenInfoMap = tokenStore.tokenInfoMap;

  const approvals = uiStore.selectedApprovals;

  const [success, setSuccess] = useState(false);

  const { sdk } = useSafeAppsSDK();

  console.log('Rendering Dialog');
  // Convert props to proper data structure

  const submitDialog = useCallback(async () => {
    const txs = createApprovals(approvals);
    const response = await sdk.txs.send({ txs: txs }).catch(() => undefined);
    if (response?.safeTxHash) {
      setSuccess(true);
    }
  }, [approvals, sdk.txs]);

  return (
    <GenericModal
      onClose={props.onCancel}
      title="Edit / Revoke Approvals"
      body={
        <div>
          {!success ? (
            <div>
              {approvals.map((approval) => {
                const amountInDecimals = new BigNumber(approval.editedAmount);
                return (
                  <ColumnGrid>
                    <FlexRowWrapper>
                      <img
                        src={tokenInfoMap?.get(approval.tokenAddress)?.logoUri}
                        width={24}
                        height={24}
                        alt={tokenInfoMap?.get(approval.tokenAddress)?.symbol}
                      />
                      <EthHashInfo hash={approval.tokenAddress} shortenHash={4} showCopyBtn />
                    </FlexRowWrapper>
                    <FlexRowWrapper>
                      <EthHashInfo hash={approval.spender} shortenHash={4} showCopyBtn />
                    </FlexRowWrapper>
                    <FlexRowWrapper>
                      <Select
                        items={[
                          {
                            id: 'revoke',
                            label: 'Revoke',
                          },
                          {
                            id: 'unlimited',
                            label: 'Unlimited',
                          },
                          {
                            id: 'custom',
                            label: 'Custom',
                          },
                        ]}
                        activeItemId={approval.inputMode}
                        onItemClick={(id) => {
                          approval.setInputMode(id as 'revoke' | 'unlimited' | 'custom');
                        }}
                      />
                      <TextFieldInput
                        name="amount"
                        disabled={approval.inputMode !== 'custom'}
                        inputMode="decimal"
                        placeholder="Amount"
                        label="Approval Amount"
                        variant="outlined"
                        value={approval.editedAmount}
                        error={amountInDecimals.isNaN() ? 'The value must be a number!' : undefined}
                        onChange={(event) => {
                          const newValue = event.target.value;
                          approval.setEditedAmount(newValue);
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
});
