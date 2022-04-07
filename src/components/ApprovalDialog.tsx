import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';
import { Button, EthHashInfo, GenericModal, TextFieldInput, Text, Checkbox } from '@gnosis.pm/safe-react-components';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react';
import { useCallback, useContext, useState } from 'react';
import styled from 'styled-components';

import { createApprovals } from '../actions/approvals';
import { UNLIMITED_ALLOWANCE } from '../constants';
import { StoreContext } from '../stores/StoreContextProvider';
import { fromWei, toWei } from '../wei';

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

  // Convert props to proper data structure

  const submitDialog = useCallback(async () => {
    const txs = createApprovals(
      approvals.map((entry) => {
        const tokenInfo = tokenInfoMap?.get(entry.tokenAddress);
        if (!tokenInfo) {
          throw new Error(`No TokenInfo found for token with address: ${entry.tokenAddress}`);
        } else {
          return {
            newValue: new BigNumber(entry.editedAmount),
            spenderAddress: entry.spender,
            tokenInfo: tokenInfo,
          };
        }
      }),
    );
    const response = await sdk.txs.send({ txs: txs }).catch(() => undefined);
    if (response?.safeTxHash) {
      setSuccess(true);
    }
  }, [approvals, sdk.txs, tokenInfoMap]);

  return (
    <GenericModal
      onClose={props.onCancel}
      title="Edit / Revoke Approvals"
      body={
        <div>
          {!success ? (
            <div>
              {approvals.map((approval) => {
                const decimals = tokenInfoMap?.get(approval.tokenAddress)?.decimals ?? 18;
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
                      <Checkbox
                        checked={UNLIMITED_ALLOWANCE.isEqualTo(toWei(approval.editedAmount, decimals))}
                        label="No Limit"
                        name="unlimited"
                        onChange={(event, checked) => {
                          const newAmount = checked
                            ? fromWei(UNLIMITED_ALLOWANCE, decimals)
                            : UNLIMITED_ALLOWANCE.isEqualTo(toWei(approval.currentAmount, decimals))
                            ? new BigNumber('0')
                            : approval.currentAmount;

                          approval.setEditedAmount(newAmount);
                        }}
                      />
                      <TextFieldInput
                        name="amount"
                        inputMode="decimal"
                        placeholder="Amount"
                        label="Approval Amount"
                        variant="standard"
                        value={approval.editedAmount}
                        error={amountInDecimals.isNaN() ? 'The value must be a number!' : undefined}
                        onChange={(event) => {
                          const newValue = event.target.value;
                          approval.setEditedAmount(new BigNumber(newValue));
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
