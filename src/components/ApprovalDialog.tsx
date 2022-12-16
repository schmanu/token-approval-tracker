import styled from '@emotion/styled';
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';
import { Avatar, Button, Dialog, DialogContent, MenuItem, Select, TextField, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react';
import { useCallback, useState } from 'react';

import { createApprovals } from '../actions/approvals';
import { useStore } from '../stores/StoreContextProvider';

import { EthHashInfo } from './EthHashInfo';

type ApprovalDialogProps = {
  onCancel: () => void;
};

const ColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 3fr 3fr 3fr;
  width: 100%;
  padding-bottom: 8px;
`;

const FlexRowWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 8px 0px;
  border-bottom: 1px solid #ddd;
`;

const changeApprovalItems: { id: 'revoke' | 'unlimited' | 'custom'; label: string }[] = [
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
];

export const ApprovalDialog = observer((props: ApprovalDialogProps) => {
  const { tokenStore, uiStore } = useStore();
  const tokenInfoMap = tokenStore.tokenInfoMap;

  const approvals = uiStore.selectedApprovals;

  const [success, setSuccess] = useState(false);

  const { sdk } = useSafeAppsSDK();

  const submitDialog = useCallback(async () => {
    const txs = createApprovals(approvals);
    const response = await sdk.txs.send({ txs: txs }).catch((reason) => {
      console.error(`Transaction could not be sent: ${reason}`);
    });
    if (response?.safeTxHash) {
      setSuccess(true);
    }
  }, [approvals, sdk.txs]);

  return (
    <Dialog onClose={props.onCancel} title="Edit / Revoke Approvals" open={true}>
      <DialogContent>
        <div>
          {!success ? (
            <div>
              {approvals.map((approval) => {
                const amountInDecimals = new BigNumber(approval.editedAmount);
                return (
                  <ColumnGrid>
                    <FlexRowWrapper>
                      <Avatar
                        src={tokenInfoMap?.get(approval.tokenAddress)?.logoUri}
                        sx={{ width: '24px', height: '24px' }}
                        alt={tokenInfoMap?.get(approval.tokenAddress)?.symbol}
                      />
                      <div>
                        <Typography>{tokenInfoMap?.get(approval.tokenAddress)?.symbol}</Typography>
                        <EthHashInfo showAvatar={false} address={approval.tokenAddress} />
                      </div>
                    </FlexRowWrapper>
                    <FlexRowWrapper>
                      <EthHashInfo avatarSize={32} address={approval.spender} />
                    </FlexRowWrapper>
                    <FlexRowWrapper>
                      <Select
                        value={approval.inputMode}
                        onChange={(event) => {
                          approval.setInputMode(event.target.value);
                        }}
                      >
                        {changeApprovalItems.map((item) => (
                          <MenuItem value={item.id}>{item.label}</MenuItem>
                        ))}
                      </Select>
                      <TextField
                        name="amount"
                        disabled={approval.inputMode !== 'custom'}
                        inputMode="decimal"
                        placeholder="Amount"
                        label="Approval Amount"
                        variant="outlined"
                        value={approval.editedAmount}
                        error={amountInDecimals.isNaN()}
                        helperText={amountInDecimals.isNaN() ? 'The value must be a number!' : undefined}
                        onFocus={(event) => event.target.select()}
                        onChange={(event) => {
                          const newValue = event.target.value;
                          approval.setEditedAmount(newValue);
                        }}
                      />
                    </FlexRowWrapper>
                  </ColumnGrid>
                );
              })}
              <Button variant="contained" onClick={submitDialog}>
                Submit
              </Button>
            </div>
          ) : (
            <Typography variant="h1">Transaction submitted. Check your transactions queue.</Typography>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});
