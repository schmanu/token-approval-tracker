import { Icon, Text } from '@gnosis.pm/safe-react-components';
import { ReactElement } from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
  display: flex;
  flex-direction: row;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: rgb(246, 247, 248);
  }
`;

const StyledIcon = styled(Icon)`
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
      <Text size="lg" strong>
        Settings
      </Text>
      <StyledIcon size="md" type="settings" />
    </StyledButton>
  );
};
