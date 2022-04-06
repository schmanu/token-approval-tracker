import styled from 'styled-components';

interface DateDisplayProps {
  isoDate: string;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const toDayString = (day: number) =>
  `${day}${day % 10 === 1 ? 'st' : day % 10 === 2 ? 'nd' : day % 10 === 3 ? 'rd' : 'th'}`;

const Wrapper = styled.div`
  display: flex;
  flexdirection: row;
  gap: 4px;
  font-family: 'Averta';
  font-size: 14px;
`;

const TimeField = styled.p``;
const DayField = styled.p``;
const MonthField = styled.p``;
const YearField = styled.p``;

export const DateDisplay = (props: DateDisplayProps) => {
  const { isoDate } = props;
  const date = new Date(isoDate);

  return (
    <Wrapper>
      <DayField>{toDayString(date.getDate())}</DayField>
      <MonthField>{MONTH_NAMES[date.getMonth()]}</MonthField>
      <YearField>{date.getFullYear()}</YearField>
      <p>-</p>
      <TimeField>{`${date.getHours()}:${date.getMinutes()}`}</TimeField>
    </Wrapper>
  );
};
