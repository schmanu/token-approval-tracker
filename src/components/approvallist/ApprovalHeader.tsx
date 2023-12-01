import styled from '@emotion/styled';
import { Box, Button, Checkbox, Divider, Typography, useTheme } from '@mui/material';
import { observer } from 'mobx-react';
import { useContext, useState } from 'react';

import { StoreContext } from '../../stores/StoreContextProvider';
import { ApprovalDialog } from '../ApprovalDialog';
import { Settings } from '../header/Settings';

import { ColumnGrid, FlexRowWrapper } from './Container';

const StyledFirstRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0px 16px;
`;

export const ApprovalHeader = observer(() => {
  const { uiStore } = useContext(StoreContext);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const theme = useTheme();
  const hasSelectedApprobals = uiStore.selectedApprovals.length > 0;

  return (
    <>
      {approvalDialogOpen && (
        <div style={{ position: 'absolute', top: '0px', height: '100%', width: '100%' }}>
          <ApprovalDialog onCancel={() => setApprovalDialogOpen(false)} />
        </div>
      )}
      <StyledFirstRow>
        <Typography variant="h4" fontWeight={700}>
          Approvals
        </Typography>
        <Box display="flex" flexDirection="row" gap={2}>
          <Settings />
          <Button
            variant={hasSelectedApprobals ? 'contained' : 'outlined'}
            disabled={!hasSelectedApprobals}
            size="large"
            onClick={() => setApprovalDialogOpen(true)}
          >
            Edit Approvals
          </Button>
        </Box>
      </StyledFirstRow>
      <Divider />
      <ColumnGrid
        style={{
          minHeight: 48,
          borderBottom: `1px solid ${theme.palette.border.main}`,
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
        <FlexRowWrapper style={{ marginLeft: '-16px' }}>
          <Typography fontWeight={700}>Balance</Typography>
        </FlexRowWrapper>
      </ColumnGrid>
    </>
  );
});
