import styled from '@emotion/styled';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Checkbox, Tooltip, FormGroup, FormControlLabel } from '@mui/material';
import { styled as muiStyled } from '@mui/system';
import { observer } from 'mobx-react';
import { ReactElement, useContext, useState } from 'react';

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
          <FormGroup>
            <StyledSettingsRow>
              <FormControlLabel
                control={
                  <Checkbox
                    name="hideRevokedApprovals"
                    checked={uiStore.hideRevokedApprovals}
                    onChange={uiStore.toggleHideRevokedApprovals}
                  />
                }
                label="Hide revoked"
              />
              <Tooltip title="Approvals with allowance 0 will be hidden">
                <HelpOutlineIcon />
              </Tooltip>
            </StyledSettingsRow>
            <StyledSettingsRow>
              <FormControlLabel
                control={
                  <Checkbox
                    name="hideZeroBalances"
                    checked={uiStore.hideZeroBalances}
                    onChange={uiStore.toggleHideZeroBalances}
                  />
                }
                label="Hide zero balances"
              />
            </StyledSettingsRow>
          </FormGroup>
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

const StyledSettingsOverlay = muiStyled('span')(({ theme }) => ({
  flexDirection: 'column',
  backgroundColor: theme.palette.background.default,
  border: 'none',
  borderRadius: '6px',
  boxShadow: '0 0 10px 0 rgba(33, 48, 77, 0.1)',
  boxSizing: 'border-box',
  position: 'absolute',
  right: '0rem',
  top: '3rem',
  zIndex: 999,
  width: '200px',
  padding: '1rem',
  display: 'flex',
}));
