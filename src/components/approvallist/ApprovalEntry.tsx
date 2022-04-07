import { EthHashInfo, Accordion, AccordionSummary, Checkbox, Text } from '@gnosis.pm/safe-react-components';
import { observer } from 'mobx-react';
import { useContext } from 'react';

import { UNLIMITED_ALLOWANCE } from '../../constants';
import { StoreContext } from '../../stores/StoreContextProvider';
import { UIApprovalEntry } from '../../stores/ui/UIStore';

import { ApprovalTransactionHistory } from './ApprovalTransactionHistory';
import { ColumnGrid, FlexRowWrapper } from './Container';

interface ApprovalEntryProps {
  approval: UIApprovalEntry;
}

export const ApprovalEntry: React.FC<ApprovalEntryProps> = observer((props) => {
  const { approval } = props;

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
                label=""
                name="markedForChange"
                onChange={approval.toggleSelected}
              />
            </div>
          </FlexRowWrapper>
          <FlexRowWrapper>
            <img
              src={tokenMap?.get(approval.tokenAddress)?.logoUri}
              width={24}
              height={24}
              alt={tokenMap?.get(approval.tokenAddress)?.symbol}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Text size="lg" strong>
                {tokenMap?.get(approval.tokenAddress)?.symbol}
              </Text>
              <EthHashInfo textSize="sm" hash={approval.tokenAddress} shortenHash={4} showCopyBtn />
            </div>
          </FlexRowWrapper>
          <FlexRowWrapper>
            <EthHashInfo hash={approval.spender} shortenHash={4} showAvatar showCopyBtn />
          </FlexRowWrapper>
          <FlexRowWrapper>
            {UNLIMITED_ALLOWANCE.isEqualTo(approval.currentAmountInWEI) ? (
              <Text size="lg" strong>
                Unlimited
              </Text>
            ) : (
              <Text size="lg" strong>
                {approval.currentAmount.toFixed()}
              </Text>
            )}
          </FlexRowWrapper>
        </ColumnGrid>
      </AccordionSummary>
      <ApprovalTransactionHistory tokenAddress={approval.tokenAddress} transactions={approval.transactions} />
    </Accordion>
  );
});
