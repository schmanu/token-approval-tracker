import { Accordion, AccordionSummary, AccordionDetails, IconText, Text, Dot } from '@gnosis.pm/safe-react-components';
import { ReactElement } from 'react';
import styled from 'styled-components';

const StyledDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledStep = styled.div`
  display: flex;
  flex-direction: row;
  padding: 1rem;
`;

const StyledDot = styled(Dot)`
  min-width: 20px;
  width: 20px;
  height: 20px;
  margin-right: 20px;
  background: #f0efee;
  color: #566976;
`;

const FAQContainer = styled.div`
  margin-top: 2rem;
  width: 65%;
`;

export const FAQSection: () => ReactElement = () => {
  return (
    <FAQContainer>
      <Accordion compact>
        <AccordionSummary>
          <IconText iconSize="md" textSize="xl" iconType="question" text="How to use this app?" />
        </AccordionSummary>
        <AccordionDetails>
          <StyledDetails>
            <StyledStep>
              <StyledDot color="primary">1</StyledDot>
              <Text size="xl">
                Select approvals to edit using the checkboxes on the left and click 'Edit Approvals'
              </Text>
            </StyledStep>
            <StyledStep>
              <StyledDot color="primary">2</StyledDot>
              <Text size="xl">
                For each selected allowance choose to either <b>revoke</b> (default selection), set to a <b>custom</b>{' '}
                amount or set to <b>unlimited</b>. The approval amounts are given in decimals (not in WEI).
              </Text>
            </StyledStep>
            <StyledStep>
              <StyledDot color="primary">3</StyledDot>
              <Text size="xl">Click 'Submit' and sign the created transaction.</Text>
            </StyledStep>
          </StyledDetails>
        </AccordionDetails>
      </Accordion>
      <Accordion compact>
        <AccordionSummary>
          <IconText iconSize="md" textSize="xl" iconType="knowledge" text="About token approvals" />
        </AccordionSummary>
        <AccordionDetails>
          <StyledDetails>
            <Text size="xl">
              ERC20 Approvals are widely used in all kinds of dapps which interact with ERC20 tokens (i.e. DEXes like
              Cowswap or 1Inch). While the concept is very convenient it comes with certain risks and problems
              <ol>
                <li>
                  It gets really hard for users to keep track of how many approvals have been given to which dapps /
                  contracts.
                </li>
                <li>
                  A lot of dapps set the approval to unlimited to save gas on future interactions / out of convenience.
                </li>
                <li>
                  Non malicious smart contracts can have vulnerabilities enabling malicious users to potential drain
                  ERC20 tokens of others if allowances still exist
                </li>
                <li>
                  Malicious contracts exists with the goal to bait people into giving ERC20 approvals for this contracts
                  to transfer all assets as soon as enough approvals are accumulated.
                </li>
              </ol>
            </Text>
          </StyledDetails>
        </AccordionDetails>
      </Accordion>
    </FAQContainer>
  );
};
