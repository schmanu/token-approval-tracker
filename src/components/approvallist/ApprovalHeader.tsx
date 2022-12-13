import styled from '@emotion/styled';
import { Checkbox, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { useContext } from 'react';

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
        <Typography variant="h3">Approvals</Typography>
        <Settings />
      </StyledFirstRow>
      <ColumnGrid
        style={{
          paddingLeft: 22,
          paddingRight: 44,
          minHeight: 48,
          width: 'inherit',
        }}
      >
        <FlexRowWrapper>
          <Checkbox
            checked={uiStore.allSelected}
            name="checkAll"
            onChange={(event, checked) => {
              uiStore.selectAll(checked);
            }}
          />
        </FlexRowWrapper>
        <FlexRowWrapper>
          <Typography fontWeight={700}>Token</Typography>
        </FlexRowWrapper>
        <FlexRowWrapper>
          <Typography fontWeight={700}>Spender</Typography>
        </FlexRowWrapper>
        <FlexRowWrapper>
          <Typography fontWeight={700}>Current Allowance</Typography>
        </FlexRowWrapper>
      </ColumnGrid>
    </>
  );
});
