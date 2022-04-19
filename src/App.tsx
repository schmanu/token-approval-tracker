import { Title, Text, Icon, Divider, Card } from '@gnosis.pm/safe-react-components';
import React from 'react';
import styled from 'styled-components';

import { ApprovalLoader } from './components/ApprovalLoader';
import { ApprovalList } from './components/approvallist/ApprovalList';
import { StoreContextProvider } from './stores/StoreContextProvider';
import { TokenStore } from './stores/tokens/TokenStore';
import { TransactionStore } from './stores/transactions/TransactionStore';
import { UIStore } from './stores/ui/UIStore';

const Container = styled.div`
  padding: 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const HeaderWrapper = styled.div`
  padding: 1rem;
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
          <Title size="xl">Token Approval Tracker</Title>
        </Row>
        <Text size="xl">✅ Keep track of all your token approvals.</Text>
        <Text size="xl">✍️ Edit / Revoke multiple approvals in a single transaction.</Text>
      </HeaderWrapper>
      <Card>
        <StoreContextProvider stores={{ tokenStore, transactionStore, uiStore }} loading={<ApprovalLoader />}>
          <ApprovalList />
        </StoreContextProvider>
      </Card>
    </Container>
  );
};

export default SafeApp;
