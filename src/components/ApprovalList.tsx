import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Card,
  Checkbox,
  Divider,
  EthHashInfo,
  Text,
  Title,
} from '@gnosis.pm/safe-react-components';
import { BigNumber } from 'bignumber.js';
import React, { useState } from 'react';
import styled from 'styled-components';

import { fromWei } from '../wei';

import { ApprovalDialog } from './ApprovalDialog';
import { DateDisplay } from './DateDisplay';
import { useApprovalTransactions, useTokenList } from './TransactionDataContext';

const ColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 0.5fr 3fr 3fr 3fr;
  width: 100%;
`;

const AccordionDetailsContainer = styled.div`
  width: 100%;
  display: flex;
  padding-right: 28px;
  flex-direction: column;
  & > div:not(:first-child) p {
    color: #aaa;
    text-decoration: line-through;
  }
`;

const FlexRowWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

export interface ApprovalEntry {
  tokenAddress: string;
  spender: string;
  amount: BigNumber;
  listPosition: number;
}

const UNLIMITED_ALLOWANCE = new BigNumber(
  '115792089237316195423570985008687907853269984665640564039457584007913129639935',
);

export const ApprovalList = () => {
  const approvals = useApprovalTransactions();
  const tokenMap = useTokenList();
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);

  const [markedForSelection, setMarkedForSelection] = useState([] as ApprovalEntry[]);

  return (
    <Card>
      <Title size="md">Approvals</Title>
      <ColumnGrid
        style={{
          paddingLeft: 22,
          paddingRight: 44,
          minHeight: 48,
          borderBottom: '2px solid #E8E7E6',
          width: 'inherit',
        }}
      >
        <FlexRowWrapper>
          <div onClick={(event) => event.stopPropagation()} style={{ width: 0 }}>
            <Checkbox
              checked={approvals?.length === markedForSelection.length}
              label=""
              name="checkAll"
              onChange={(event, checked) => {
                if (checked) {
                  setMarkedForSelection(
                    approvals?.map((approval, idx) => ({
                      tokenAddress: approval.tokenAddress,
                      amount: fromWei(
                        new BigNumber(approval.allowance),
                        tokenMap?.get(approval.tokenAddress)?.decimals ?? 18,
                      ),
                      spender: approval.spender,
                      listPosition: idx,
                    })) ?? [],
                  );
                } else {
                  setMarkedForSelection([]);
                }
              }}
            />
          </div>
        </FlexRowWrapper>
        <FlexRowWrapper>
          <Text size="xl" strong>
            Token
          </Text>
        </FlexRowWrapper>
        <FlexRowWrapper>
          <Text size="xl" strong>
            Spender
          </Text>
        </FlexRowWrapper>
        <FlexRowWrapper>
          <Text size="xl" strong>
            Current Allowance
          </Text>
        </FlexRowWrapper>
      </ColumnGrid>

      {approvals?.map((approval, idx) => {
        const containsApproval = (value: ApprovalEntry) =>
          value.spender === approval.spender && value.tokenAddress === approval.tokenAddress;
        const key = `${approval.tokenAddress};${approval.spender}`;
        return (
          <Accordion key={key}>
            <AccordionSummary>
              <ColumnGrid>
                <FlexRowWrapper>
                  {/* small wrapper which stops the accordion from reacting to a checkbox click */}
                  <div onClick={(event) => event.stopPropagation()} style={{ width: 0 }}>
                    <Checkbox
                      checked={markedForSelection.some(containsApproval)}
                      label=""
                      name="markedForChange"
                      onChange={(event, checked) => {
                        if (checked) {
                          setMarkedForSelection([
                            ...markedForSelection,
                            {
                              amount: fromWei(
                                new BigNumber(approval.allowance),
                                tokenMap?.get(approval.tokenAddress)?.decimals ?? 18,
                              ),
                              spender: approval.spender,
                              tokenAddress: approval.tokenAddress,
                              listPosition: idx,
                            },
                          ]);
                        } else {
                          setMarkedForSelection(markedForSelection.filter((value) => !containsApproval(value)));
                        }
                      }}
                    />
                  </div>
                </FlexRowWrapper>
                <FlexRowWrapper>
                  <img
                    src={tokenMap?.get(approval.tokenAddress)?.logoUri}
                    width={24}
                    height={24}
                    alt={tokenMap?.get(approval.tokenAddress)?.symbol}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text size="lg" strong>
                      {tokenMap?.get(approval.tokenAddress)?.symbol}
                    </Text>
                    <EthHashInfo textSize="sm" hash={approval.tokenAddress} shortenHash={4} showCopyBtn />
                  </div>
                </FlexRowWrapper>
                <FlexRowWrapper>
                  <EthHashInfo hash={approval.spender} shortenHash={4} showAvatar showCopyBtn />
                </FlexRowWrapper>
                <FlexRowWrapper>
                  {UNLIMITED_ALLOWANCE.isEqualTo(approval.allowance) ? (
                    <Text size="lg" strong>
                      Unlimited
                    </Text>
                  ) : (
                    <Text size="lg" strong>
                      {fromWei(
                        new BigNumber(approval.allowance),
                        tokenMap?.get(approval.tokenAddress)?.decimals ?? 18,
                      ).toFixed()}
                    </Text>
                  )}
                </FlexRowWrapper>
              </ColumnGrid>
            </AccordionSummary>
            <AccordionDetails>
              <AccordionDetailsContainer>
                {approval.transactions.map((tx, idx) => (
                  <>
                    <ColumnGrid>
                      <FlexRowWrapper></FlexRowWrapper>
                      <FlexRowWrapper>
                        <Text size="lg" strong>
                          TX hash:
                        </Text>
                        <EthHashInfo hash={tx.txHash} shortenHash={4} showCopyBtn />
                      </FlexRowWrapper>
                      <FlexRowWrapper>
                        <Text size="lg" strong>
                          Date:
                        </Text>
                        <DateDisplay isoDate={tx.executionDate} />
                      </FlexRowWrapper>
                      <FlexRowWrapper>
                        <Text size="lg" strong>
                          Amount:
                        </Text>
                        {UNLIMITED_ALLOWANCE.isEqualTo(tx.value ?? 0) ? (
                          <Text size="lg">Unlimited</Text>
                        ) : (
                          <Text size="lg">
                            {fromWei(
                              new BigNumber(tx.value ?? 0),
                              tokenMap?.get(approval.tokenAddress)?.decimals ?? 18,
                            ).toFixed()}
                          </Text>
                        )}
                      </FlexRowWrapper>
                    </ColumnGrid>
                    <Divider orientation="horizontal" />
                  </>
                ))}
              </AccordionDetailsContainer>
            </AccordionDetails>
          </Accordion>
        );
      })}
      <Button
        variant={markedForSelection.length === 0 ? 'bordered' : 'contained'}
        disabled={markedForSelection.length === 0}
        style={{ marginTop: 16 }}
        size="lg"
        onClick={() => setApprovalDialogOpen(true)}
      >
        Edit Approvals
      </Button>
      {approvalDialogOpen && (
        <div style={{ position: 'absolute', top: '0px', height: '100%', width: '100%' }}>
          <ApprovalDialog approvals={markedForSelection} onCancel={() => setApprovalDialogOpen(false)} />
        </div>
      )}
    </Card>
  );
};
