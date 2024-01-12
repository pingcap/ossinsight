import { AxiosError } from 'axios';
import { getAxiosErrorPayload, getErrorMessage, isAxiosError } from '@site/src/utils/error';
import { isNonemptyString, notFalsy, notNullish } from '@site/src/utils/value';

export function isSqlError (error: unknown): error is AxiosError<{ message: string, querySQL: string }> {
  if (isAxiosError(error) && notNullish(error.response)) {
    if (notNullish(error.response.data)) {
      return typeof error.response.data.message === 'string' && typeof error.response.data.querySQL === 'string';
    }
  }
  return false;
}

export function notNone<T> (value: T): value is Exclude<T, undefined | null> {
  if (isNonemptyString(value)) {
    return !['none', 'n/a'].includes(value.toLowerCase());
  }
  return notFalsy(value);
}

export function extractTime (error: AxiosError) {
  const payload = getAxiosErrorPayload(error) as any;
  if (notNullish(payload?.waitMinutes)) {
    return `${payload?.waitMinutes as string} minutes`;
  }
  const res = getErrorMessage(error).match(/please wait (.+)\./);
  if (notNullish(res)) {
    return res[1];
  }
  return '30 minutes';
}
