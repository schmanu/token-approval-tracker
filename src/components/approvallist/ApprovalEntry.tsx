import { Accordion, AccordionSummary, Avatar, Checkbox, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { useContext } from 'react';

import { UNLIMITED_ALLOWANCE } from '../../constants';
import { StoreContext } from '../../stores/StoreContextProvider';
import { UIApprovalEntry } from '../../stores/ui/UIStore';
import { EthHashInfo } from '../EthHashInfo';

import { ApprovalTransactionHistory } from './ApprovalTransactionHistory';
import { ColumnGrid, FlexRowWrapper } from './Container';

interface ApprovalEntryProps {
  approval: UIApprovalEntry;
}

export const ApprovalEntry = observer(({ approval }: ApprovalEntryProps) => {
  const { tokenStore } = useContext(StoreContext);
  const tokenMap = tokenStore.tokenInfoMap;

  return (
    <Accordion key={approval.id}>
      <AccordionSummary>
        <ColumnGrid>
          <FlexRowWrapper>
            {/* small wrapper which stops the accordion from reacting to a checkbox click */}
            <div onClick={(event) => event.stopPropagation()} style={{ width: 0 }}>
              <Checkbox
                checked={approval.selected}
                name="markedForChange"
                onChange={(event) => {
                  event?.stopPropagation();
                  approval.toggleSelected();
                }}
              />
            </div>
          </FlexRowWrapper>
          <FlexRowWrapper>
            <Avatar
              src={tokenMap?.get(approval.tokenAddress)?.logoUri}
              sx={{ width: '24px', height: '24px' }}
              alt={tokenMap?.get(approval.tokenAddress)?.symbol}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Typography fontWeight={700}>{tokenMap?.get(approval.tokenAddress)?.symbol}</Typography>
              <EthHashInfo address={approval.tokenAddress} showAvatar={false} />
            </div>
          </FlexRowWrapper>
          <FlexRowWrapper>
            <EthHashInfo address={approval.spender} avatarSize={32} />
          </FlexRowWrapper>
          <FlexRowWrapper>
            <Typography fontWeight={700}>
              {UNLIMITED_ALLOWANCE.isEqualTo(approval.currentAmountInWEI)
                ? 'Unlimited'
                : approval.currentAmount.toFixed()}
            </Typography>
          </FlexRowWrapper>
        </ColumnGrid>
      </AccordionSummary>
      <ApprovalTransactionHistory tokenAddress={approval.tokenAddress} transactions={approval.transactions} />
    </Accordion>
  );
});
