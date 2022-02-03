import { Title, Text } from '@gnosis.pm/safe-react-components';
import React from 'react';
import styled from 'styled-components';

import { ApprovalList } from './components/ApprovalList';
import { ApprovalLoader } from './components/ApprovalLoader';
import { TransactionDataContextProvider } from './components/TransactionDataContext';

const Container = styled.div`
  padding: 1rem;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const SafeApp = (): React.ReactElement => {
  return (
    <TransactionDataContextProvider loading={<ApprovalLoader />}>
      <Container>
        <Title size="xl">Token Approval Tracker</Title>
        <Text size="xl">✅ Keep track of all your token approvals.</Text>
        <Text size="xl">✍️ Edit / Revoke multiple approvals in one transaction.</Text>
        <Text size="xl">🔔 Get notified about approvals for malicious contracts.</Text>
        <ApprovalList />
      </Container>
    </TransactionDataContextProvider>
  );
};

export default SafeApp;
