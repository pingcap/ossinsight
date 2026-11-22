/** Errors can contain SQL values, GitHub profiles and authorization headers. */
export function safeError(error: any): Record<string, string | number> {
  const result: Record<string, string | number> = {type: 'Error'};
  if (typeof error?.code === 'string' && /^(?:P\d{4}|E[A-Z0-9_]{1,60})$/.test(error.code)) result.code = error.code;
  if (Number.isInteger(error?.status) && error.status >= 400 && error.status <= 599) result.status = error.status;
  return result;
}
