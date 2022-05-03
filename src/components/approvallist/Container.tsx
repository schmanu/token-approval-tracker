import styled from 'styled-components';

export const ColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 0.5fr 3fr 3fr 3fr;
  width: 100%;
`;

// This is only used in one component. I'd keep it there.
export const AccordionDetailsContainer = styled.div`
  width: 100%;
  display: flex;
  padding-right: 28px;
  flex-direction: column;
  & > div:not(:first-child) p {
    color: #aaa;
    text-decoration: line-through;
  }
`;

export const FlexRowWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;
