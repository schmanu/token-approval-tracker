import { Text } from '@gnosis.pm/safe-react-components';
import { ReactElement } from 'react';
import styled from 'styled-components';

import githublogo from '../static/github.png';

const StyledFooterRow = styled.div`
  display: flex;
  flex-direction: row;
  align-self: flex-start;
  padding: 1rem;
  align-items: center;
  gap: 0.75rem;
`;

export const Footer: () => ReactElement = () => {
  return (
    <StyledFooterRow>
      <Text size="sm">v{process.env.REACT_APP_VERSION}</Text>
      <a target="_blank" href="https://github.com/schmanu/token-approval-tracker" rel="noreferrer">
        <img src={githublogo} width={16} height={16} alt="github" />
      </a>
    </StyledFooterRow>
  );
};
