export function upBound (num: number): number {
  if (num === 0) {
    return 0;
  }

  const sign = Math.sign(num);
  const mag = Math.abs(num);

  let base = 1;
  while (mag > base) {
    base *= 10;
  }
  base /= 20;

  return (Math.floor(mag / base) + 1) * base * sign;
}
