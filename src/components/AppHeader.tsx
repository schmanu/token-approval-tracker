import { CheckOutlined } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';

export const AppHeader = () => (
  <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" width="100%">
    <Typography variant="h1">Token Approval Manager</Typography>
    <Box>
      <Box display="flex" flexDirection="row" alignItems="center" gap={2}>
        <CheckOutlined
          sx={{
            backgroundColor: ({ palette }) => palette.info.background,
            color: ({ palette }) => palette.info.main,
            borderRadius: '12px',
          }}
        />
        <Typography>Keep track of all your token approvals.</Typography>
      </Box>

      <Box display="flex" flexDirection="row" alignItems="center" gap={2}>
        <CheckOutlined
          sx={{
            backgroundColor: ({ palette }) => palette.info.background,
            color: ({ palette }) => palette.info.main,
            borderRadius: '12px',
          }}
        />
        <Typography>Edit / Revoke multiple approvals in a single transaction.</Typography>
      </Box>
    </Box>
  </Box>
);
