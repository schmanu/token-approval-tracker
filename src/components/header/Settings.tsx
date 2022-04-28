import { Checkbox, Icon, Tooltip } from '@gnosis.pm/safe-react-components';
import { observer } from 'mobx-react';
import { ReactElement, useContext, useState } from 'react';
import styled from 'styled-components';

import { StoreContext } from '../../stores/StoreContextProvider';

import { SettingsButton } from './SettingsButton';

export const Settings: () => ReactElement = observer(() => {
  const [isOpen, setIsOpen] = useState(false);
  const { uiStore } = useContext(StoreContext);

  return (
    <Wrapper>
      <SettingsButton onClick={() => setIsOpen(!isOpen)} />
      {isOpen && (
        <StyledSettingsOverlay>
          <StyledSettingsRow>
            <Checkbox
              name="hideRevokedApprovals"
              checked={uiStore.hideRevokedApprovals}
              label="Hide revoked"
              onChange={uiStore.toggleHideRevokedApprovals}
            />
            <Tooltip title="Approvals with allowance 0 will be hidden">
              <span>
                <Icon size="md" type="question" />
              </span>
            </Tooltip>
          </StyledSettingsRow>
        </StyledSettingsOverlay>
      )}
    </Wrapper>
  );
});

const Wrapper = styled.div`
  position: relative;
  display: flex;
`;

const StyledSettingsRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const StyledSettingsOverlay = styled.span`
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border: none;
  border-radius: 8px;
  box-shadow: 0 0 10px 0 rgba(33, 48, 77, 0.1);
  box-sizing: border-box;
  position: absolute;
  right: 0rem;
  top: 1.75rem;
  z-index: 999;
  width: 200px;
  padding: 1rem;
`;
