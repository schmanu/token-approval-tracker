import styled from '@emotion/styled';
import GitHubIcon from '@mui/icons-material/GitHub';
import { Link, Typography } from '@mui/material';
import { ReactElement } from 'react';

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

      <Link target="_blank" href="https://github.com/schmanu/token-approval-tracker" rel="noreferrer">
        <GitHubIcon />
      </Link>
    </StyledFooterRow>
  );
};
