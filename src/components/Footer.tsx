import styled from '@emotion/styled';
import { Typography } from '@mui/material';
import { ReactElement } from 'react';

import githublogo from '../static/github.png';

const StyledFooterRow = styled.div`
  display: flex;
  flex-direction: row;
  padding: 1rem;
  align-items: center;
  gap: 0.75rem;
`;

export const Footer: () => ReactElement = () => {
  return (
    <StyledFooterRow>
      <Typography>v{process.env.REACT_APP_VERSION}</Typography>
      <a target="_blank" href="https://github.com/schmanu/token-approval-tracker" rel="noreferrer">
        <img src={githublogo} width={16} height={16} alt="github" />
      </a>
    </StyledFooterRow>
  );
};
