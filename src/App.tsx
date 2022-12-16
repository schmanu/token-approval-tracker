import styled from '@emotion/styled';
import { Card, Typography } from '@mui/material';
import React from 'react';

import { ApprovalLoader } from './components/ApprovalLoader';
import { Footer } from './components/Footer';
import { ApprovalList } from './components/approvallist/ApprovalList';
import { FAQSection } from './components/approvallist/FAQSection';
import { StoreContextProvider } from './stores/StoreContextProvider';
import { BalanceStore } from './stores/tokens/BalanceStore';
import { TokenStore } from './stores/tokens/TokenStore';
import { TransactionStore } from './stores/transactions/TransactionStore';
import { UIStore } from './stores/ui/UIStore';

const HeaderWrapper = styled.div`
  padding: 1rem;
  padding-top: 0rem;
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
`;

const tokenStore = new TokenStore();

const balanceStore = new BalanceStore();

const transactionStore = new TransactionStore();

const uiStore = new UIStore();

const SafeApp = (): React.ReactElement => {
  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100vh',
        overflow: 'auto',
        backgroundColor: ({ palette }) => palette.background.default,
      }}
    >
      <HeaderWrapper>
        <Row>
          <img src={`${process.env.PUBLIC_URL}/logo.svg`} width={64} height={64} alt="Logo"></img>
          <Typography variant="h1">Token Approval Manager</Typography>
        </Row>
        <Typography>✅ Keep track of all your token approvals.</Typography>
        <Typography>✍️ Edit / Revoke multiple approvals in a single transaction.</Typography>
      </HeaderWrapper>
      <Card sx={{ width: '90vw', padding: '16px 32px', overflow: 'visible' }} elevation={0}>
        <StoreContextProvider
          stores={{ tokenStore, transactionStore, uiStore, balanceStore }}
          loading={<ApprovalLoader />}
        >
          <ApprovalList />
        </StoreContextProvider>
      </Card>
      <FAQSection />
      <Footer />
    </Card>
  );
};

export default SafeApp;
