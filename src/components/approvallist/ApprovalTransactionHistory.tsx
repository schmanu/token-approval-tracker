import { AccordionDetails, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react';
import { useContext } from 'react';

import { UNLIMITED_ALLOWANCE } from '../../constants';
import { StoreContext } from '../../stores/StoreContextProvider';
import { Transaction } from '../../stores/transactions/TransactionStore';
import { fromWei } from '../../utils/wei';
import { DateDisplay } from '../DateDisplay';

import { AccordionDetailsContainer, ColumnGrid, FlexRowWrapper } from './Container';

interface ApprovalTransactionHistoryProps {
  transactions: Transaction[];
  tokenAddress: string;
}

export const ApprovalTransactionHistory: React.FC<ApprovalTransactionHistoryProps> = observer((props) => {
  const { transactions, tokenAddress } = props;

  const { tokenStore } = useContext(StoreContext);
  const tokenMap = tokenStore.tokenInfoMap;

  return (
    <AccordionDetails>
      <AccordionDetailsContainer>
        {transactions.map((tx) => (
          <div key={tx.txHash}>
            <ColumnGrid key={tx.txHash}>
              <FlexRowWrapper></FlexRowWrapper>
              <FlexRowWrapper>
                <Typography variant="subtitle2">TX hash:</Typography>
                {/* {tx.txHash && <EthHashInfo hash={tx.txHash} shortenHash={4} showCopyBtn />} */}
              </FlexRowWrapper>
              <FlexRowWrapper>
                <Typography variant="subtitle2">Date:</Typography>
                {tx.executionDate && <DateDisplay value={tx.executionDate} />}
              </FlexRowWrapper>
              <FlexRowWrapper>
                <Typography variant="subtitle2">Amount:</Typography>
                {UNLIMITED_ALLOWANCE.isEqualTo(tx.value ?? 0) ? (
                  <Typography>Unlimited</Typography>
                ) : (
                  <Typography>
                    {fromWei(new BigNumber(tx.value ?? 0), tokenMap?.get(tokenAddress)?.decimals ?? 18).toFixed()}
                  </Typography>
                )}
              </FlexRowWrapper>
            </ColumnGrid>
          </div>
        ))}
      </AccordionDetailsContainer>
    </AccordionDetails>
  );
});
