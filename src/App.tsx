import { Title, Text } from '@gnosis.pm/safe-react-components';
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
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const tokenStore = new TokenStore();

const transactionStore = new TransactionStore();

const uiStore = new UIStore();

const SafeApp = (): React.ReactElement => {
  return (
    <StoreContextProvider stores={{ tokenStore, transactionStore, uiStore }} loading={<ApprovalLoader />}>
      <Container>
        <Title size="xl">Token Approval Tracker</Title>
        <Text size="xl">✅ Keep track of all your token approvals.</Text>
        <Text size="xl">✍️ Edit / Revoke multiple approvals in one transaction.</Text>
        <Text size="xl">🔔 Get notified about approvals for malicious contracts.</Text>
        <ApprovalList />
      </Container>
    </StoreContextProvider>
  );
};

export default SafeApp;
