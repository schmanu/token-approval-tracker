import { Title, Text, Card } from '@gnosis.pm/safe-react-components';
import React from 'react';
import styled from 'styled-components';

import { ApprovalLoader } from './components/ApprovalLoader';
import { Footer } from './components/Footer';
import { ApprovalList } from './components/approvallist/ApprovalList';
import { FAQSection } from './components/approvallist/FAQSection';
import { StoreContextProvider } from './stores/StoreContextProvider';
import { TokenStore } from './stores/tokens/TokenStore';
import { TransactionStore } from './stores/transactions/TransactionStore';
import { UIStore } from './stores/ui/UIStore';

const Container = styled.div`
  padding: 1rem;
  padding-top: 0rem;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

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
`;

const tokenStore = new TokenStore();

const transactionStore = new TransactionStore();

const uiStore = new UIStore();

const SafeApp = (): React.ReactElement => {
  return (
    <Container>
      <HeaderWrapper>
        <Row>
          <img src="/logo.svg" width={64} height={64} alt="Logo"></img>
          <Title size="xl">Token Approval Manager</Title>
        </Row>
        <Text size="xl">✅ Keep track of all your token approvals.</Text>
        <Text size="xl">✍️ Edit / Revoke multiple approvals in a single transaction.</Text>
      </HeaderWrapper>
      <Card>
        <StoreContextProvider stores={{ tokenStore, transactionStore, uiStore }} loading={<ApprovalLoader />}>
          <ApprovalList />
        </StoreContextProvider>
      </Card>
      <FAQSection />
      <Footer />
    </Container>
  );
};

export default SafeApp;
