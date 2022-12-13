import styled from '@emotion/styled';
import { Typography } from '@mui/material';

interface DateDisplayProps {
  value: string | number;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const toDayString = (day: number) =>
  `${day}${day % 10 === 1 ? 'st' : day % 10 === 2 ? 'nd' : day % 10 === 3 ? 'rd' : 'th'}`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  font-size: 14px;
`;
export const DateDisplay = (props: DateDisplayProps) => {
  const { value } = props;
  const date = new Date(value);

  return (
    <Wrapper>
      <Typography>{toDayString(date.getDate())}</Typography>
      <Typography>{MONTH_NAMES[date.getMonth()]}</Typography>
      <Typography>{date.getFullYear()}</Typography>
      <Typography>-</Typography>
      <Typography>{`${date.getHours()}:${date.getMinutes() < 10 ? 0 : ''}${date.getMinutes()}`}</Typography>
    </Wrapper>
  );
};
