import styled from '@emotion/styled';
import { CircularProgress, Typography } from '@mui/material';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  justify-content: center;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

export const ApprovalLoader = () => (
  <Wrapper>
    <Typography variant="h1">Loading Approvals</Typography>
    <CircularProgress size="lg" />
  </Wrapper>
);
