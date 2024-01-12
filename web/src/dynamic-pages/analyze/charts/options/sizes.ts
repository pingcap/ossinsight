import { dangerousGetCtx } from './_danger';

export function isSmall () {
  const { isSmall } = dangerousGetCtx();
  return isSmall;
}
