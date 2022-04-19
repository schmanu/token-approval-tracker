import { Loader, Text } from '@gnosis.pm/safe-react-components';
import styled from 'styled-components';

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
    <Text size="xl">Loading Approvals</Text>
    <Loader size="lg" />
  </Wrapper>
);
