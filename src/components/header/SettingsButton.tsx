import styled from '@emotion/styled/macro';
import SettingsIcon from '@mui/icons-material/Settings';
import { Button, Typography } from '@mui/material';
import { ReactElement } from 'react';

const StyledButton = styled(Button)`
  display: flex;
  flex-direction: row;
  cursor: pointer;
`;

const StyledIcon = styled(SettingsIcon)`
  transition: 0.3s ease;
  & .icon-color {
    fill: #001428;
  }
  ${StyledButton}:hover & {
    transform: rotate(180deg);
  }
`;

interface SettingsButtonProps {
  onClick: () => void;
}

export const SettingsButton: (props: SettingsButtonProps) => ReactElement = (props) => {
  const { onClick } = props;
  return (
    <StyledButton onClick={onClick}>
      <Typography fontWeight={700}>Settings</Typography>
      <StyledIcon />
    </StyledButton>
  );
};
