import { BigNumber } from 'bignumber.js';

const TEN = new BigNumber(10);

export function toWei(amount: string | number | BigNumber, decimals: number): BigNumber {
  let res = TEN.pow(decimals).multipliedBy(amount);
  if ((res.decimalPlaces() ?? 0) > 0) {
    res = res.decimalPlaces(0, BigNumber.ROUND_DOWN);
  }
  return res;
}

export function fromWei(amount: BigNumber, decimals: number): BigNumber {
  return amount.dividedBy(TEN.pow(decimals));
}
