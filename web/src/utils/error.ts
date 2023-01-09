import { AxiosError } from 'axios';
import { isFalsy, isNonemptyString, notNullish } from '@site/src/utils/value';

interface HaveMessage {
  message: string;
}

export function isAxiosError (e: unknown): e is AxiosError {
  if (e != null && typeof e === 'object') {
    return !!(e as AxiosError)?.isAxiosError;
  } else {
    return false;
  }
}

export function isAxiosHttpStatusError (e: unknown, status: number): e is AxiosError {
  return isAxiosError(e) && notNullish(e.response) && e.response.status === status;
}

export function hasMessage (e: unknown): e is HaveMessage {
  return e != null && typeof e === 'object' && typeof (e as HaveMessage)?.message === 'string';
}

const ERROR_MESSAGE_FIELDS = ['msg', 'sqlMessage', 'message'];

export function getErrorMessage (e: unknown): string {
  if (isAxiosError(e)) {
    if (notNullish(e.response)) {
      const { data } = e.response;
      const msg = ERROR_MESSAGE_FIELDS.reduce((msg: string | undefined, field) => msg ?? data?.[field], undefined);
      if (isNonemptyString(msg)) {
        return msg;
      }
    }
    return e.message;
  } else if (hasMessage(e)) {
    return e.message;
  } else {
    return String(e ?? 'no error message.');
  }
}

export function getOptionalErrorMessage (e: unknown): string | undefined {
  if (isFalsy(e)) {
    return undefined;
  } else {
    return getErrorMessage(e);
  }
}
