import { EthHashInfo, AccordionDetails, Divider, Text } from '@gnosis.pm/safe-react-components';
import {} from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react';
import { useContext } from 'react';

import { UNLIMITED_ALLOWANCE } from '../../constants';
import { StoreContext } from '../../stores/StoreContextProvider';
import { Transaction } from '../../stores/transactions/TransactionStore';
import { fromWei } from '../../wei';
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
          <>
            <ColumnGrid key={tx.txHash}>
              <FlexRowWrapper></FlexRowWrapper>
              <FlexRowWrapper>
                <Text size="lg" strong>
                  TX hash:
                </Text>
                {tx.txHash && <EthHashInfo hash={tx.txHash} shortenHash={4} showCopyBtn />}
              </FlexRowWrapper>
              <FlexRowWrapper>
                <Text size="lg" strong>
                  Date:
                </Text>
                {tx.executionDate && <DateDisplay value={tx.executionDate} />}
              </FlexRowWrapper>
              <FlexRowWrapper>
                <Text size="lg" strong>
                  Amount:
                </Text>
                {UNLIMITED_ALLOWANCE.isEqualTo(tx.value ?? 0) ? (
                  <Text size="lg">Unlimited</Text>
                ) : (
                  <Text size="lg">
                    {fromWei(new BigNumber(tx.value ?? 0), tokenMap?.get(tokenAddress)?.decimals ?? 18).toFixed()}
                  </Text>
                )}
              </FlexRowWrapper>
            </ColumnGrid>
            <Divider orientation="horizontal" />
          </>
        ))}
      </AccordionDetailsContainer>
    </AccordionDetails>
  );
});
