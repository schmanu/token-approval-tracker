import { Box, CircularProgress, Typography } from '@mui/material';

export const ApprovalLoader = () => (
  <Box display="flex" flexDirection="row" gap={2} alignItems="center" justifyContent="center">
    <CircularProgress />
    <Typography variant="h1">Loading Approvals</Typography>
  </Box>
);
