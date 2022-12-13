import styled from '@emotion/styled';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SchoolIcon from '@mui/icons-material/School';
import { Accordion, AccordionSummary, AccordionDetails, Badge, Typography } from '@mui/material';
import { styled as muiStyled } from '@mui/system';
import { ReactElement } from 'react';

const StyledDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledStep = styled.div`
  display: flex;
  flex-direction: row;
  padding: 1rem;
`;

const StyledDot = muiStyled(Badge)(({ theme }) => ({
  minWidth: '20px',
  width: '20px',
  height: '20px',
  marginRight: '20px',
  backgroundColor: theme.palette.background.dark,
  color: theme.palette.text.secondary,
}));

const FAQContainer = styled.div`
  margin-top: 2rem;
  margin-left: 16px;
  width: 65%;
`;

export const FAQSection: () => ReactElement = () => {
  return (
    <FAQContainer>
      <Accordion>
        <AccordionSummary>
          <HelpOutlineIcon />

          <Typography ml={1}>How to use this app?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <StyledDetails>
            <StyledStep>
              <StyledDot color="primary">1</StyledDot>
              <Typography>
                Select approvals to edit using the checkboxes on the left and click 'Edit Approvals'
              </Typography>
            </StyledStep>
            <StyledStep>
              <StyledDot color="primary">2</StyledDot>
              <Typography>
                For each selected allowance choose to either <b>revoke</b> (default selection), set to a <b>custom</b>{' '}
                amount or set to <b>unlimited</b>. The approval amounts are given in decimals (not in WEI).
              </Typography>
            </StyledStep>
            <StyledStep>
              <StyledDot color="primary">3</StyledDot>
              <Typography>Click 'Submit' and sign the created transaction.</Typography>
            </StyledStep>
          </StyledDetails>
        </AccordionDetails>
      </Accordion>
      <Accordion sx={{ marginTop: 2 }}>
        <AccordionSummary>
          <SchoolIcon />
          <Typography ml={1}>About token approvals</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <StyledDetails>
            <Typography>
              ERC20 Approvals are widely used in all kinds of dapps which interact with ERC20 tokens (i.e. DEXes like
              Cowswap or 1Inch). While the concept is very convenient it comes with certain risks and problems:
            </Typography>
            <ol>
              <li>
                <Typography>
                  It gets really hard for users to keep track of how many approvals have been given to which dapps /
                  contracts.
                </Typography>
              </li>
              <li>
                <Typography>
                  A lot of dapps set the approval to unlimited to save gas on future interactions / out of convenience.
                </Typography>
              </li>
              <li>
                <Typography>
                  Non malicious smart contracts can have vulnerabilities enabling malicious users to potential drain
                  ERC20 tokens of others if allowances still exist.
                </Typography>
              </li>
              <li>
                <Typography>
                  Malicious contracts exist which intentionally bait people into giving ERC20 approvals to drain their
                  funds.
                </Typography>
              </li>
            </ol>
          </StyledDetails>
        </AccordionDetails>
      </Accordion>
    </FAQContainer>
  );
};
