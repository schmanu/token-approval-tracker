import { Title, Checkbox, Text } from '@gnosis.pm/safe-react-components';
import { observer } from 'mobx-react';
import { useContext } from 'react';
import styled from 'styled-components';

import { StoreContext } from '../../stores/StoreContextProvider';
import { Settings } from '../header/Settings';

import { ColumnGrid, FlexRowWrapper } from './Container';

const StyledFirstRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const ApprovalHeader = observer(() => {
  const { uiStore } = useContext(StoreContext);

  return (
    <>
      <StyledFirstRow>
        <Title size="md">Approvals</Title>
        <Settings />
      </StyledFirstRow>
      <ColumnGrid
        style={{
          paddingLeft: 22,
          paddingRight: 44,
          minHeight: 48,
          borderBottom: '2px solid #E8E7E6',
          width: 'inherit',
        }}
      >
        <FlexRowWrapper>
          <div onClick={(event) => event.stopPropagation()} style={{ width: 0 }}>
            <Checkbox
              checked={uiStore.allSelected}
              label=""
              name="checkAll"
              onChange={(event, checked) => {
                uiStore.selectAll(checked);
              }}
            />
          </div>
        </FlexRowWrapper>
        <FlexRowWrapper>
          <Text size="xl" strong>
            Token
          </Text>
        </FlexRowWrapper>
        <FlexRowWrapper>
          <Text size="xl" strong>
            Spender
          </Text>
        </FlexRowWrapper>
        <FlexRowWrapper>
          <Text size="xl" strong>
            Current Allowance
          </Text>
        </FlexRowWrapper>
      </ColumnGrid>
    </>
  );
});
