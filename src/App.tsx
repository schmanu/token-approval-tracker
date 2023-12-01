import { Box, Card } from '@mui/material';
import React from 'react';

import { AppHeader } from './components/AppHeader';
import { ApprovalLoader } from './components/ApprovalLoader';
import { Footer } from './components/Footer';
import { ApprovalList } from './components/approvallist/ApprovalList';
import { FAQSection } from './components/approvallist/FAQSection';
import { StoreContextProvider } from './stores/StoreContextProvider';
import { BalanceStore } from './stores/tokens/BalanceStore';
import { TokenStore } from './stores/tokens/TokenStore';
import { TransactionStore } from './stores/transactions/TransactionStore';
import { UIStore } from './stores/ui/UIStore';

import './styles/globals.css';

const tokenStore = new TokenStore();

const balanceStore = new BalanceStore();

const transactionStore = new TransactionStore();

const uiStore = new UIStore();

const SafeApp = (): React.ReactElement => {
  return (
    <Box
      sx={{
        maxWidth: '1000px',
        paddingTop: '24px',
        position: 'relative',
        margin: 'auto',
      }}
    >
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <AppHeader />
        <Card sx={{ padding: '16px 0px', overflow: 'visible', width: '100%' }} elevation={0}>
          <StoreContextProvider
            stores={{ tokenStore, transactionStore, uiStore, balanceStore }}
            loading={<ApprovalLoader />}
          >
            <ApprovalList />
          </StoreContextProvider>
        </Card>
        <FAQSection />
        <Footer />
      </Box>
    </Box>
  );
};

export default SafeApp;
