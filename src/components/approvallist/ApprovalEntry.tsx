import { Avatar, Checkbox, Typography, useTheme } from '@mui/material';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react';
import { useContext } from 'react';

import { UNLIMITED_ALLOWANCE } from '../../constants';
import { StoreContext } from '../../stores/StoreContextProvider';
import { UIApprovalEntry } from '../../stores/ui/UIStore';
import { formatAmount } from '../../utils/formatAmount';
import { fromWei } from '../../utils/wei';
import { EthHashInfo } from '../EthHashInfo';

import { ColumnGrid, FlexRowWrapper } from './Container';

interface ApprovalEntryProps {
  approval: UIApprovalEntry;
}

export const ApprovalEntry = observer(({ approval }: ApprovalEntryProps) => {
  const { tokenStore, balanceStore } = useContext(StoreContext);
  const tokenMap = tokenStore.tokenInfoMap;
  const balances = balanceStore.balances;
  const theme = useTheme();

  const tokenBalance = balances.items.find((item) => item.tokenInfo.address === approval.tokenAddress);

  return (
    <ColumnGrid style={{ borderBottom: `1px solid ${theme.palette.border.main}` }}>
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
        <Typography
          fontWeight={700}
          sx={{
            maxWidth: '400px',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
        >
          {UNLIMITED_ALLOWANCE.isEqualTo(approval.currentAmountInWEI)
            ? 'Unlimited'
            : formatAmount(approval.currentAmount.toNumber(), 2)}
        </Typography>
      </FlexRowWrapper>
      <FlexRowWrapper>
        <Typography fontWeight={700}>
          {tokenBalance
            ? fromWei(new BigNumber(tokenBalance.balance), tokenBalance.tokenInfo.decimals).toFixed(3)
            : '0'}
        </Typography>
      </FlexRowWrapper>
    </ColumnGrid>
  );
});
