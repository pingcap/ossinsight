import { AxiosError } from 'axios';

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

export function hasMessage (e: unknown): e is HaveMessage {
  return e != null && typeof e === 'object' && typeof (e as HaveMessage)?.message === 'string';
}

export function getErrorMessage (e: unknown): string {
  if (isAxiosError(e)) {
    return e.response?.data?.message ?? e.message;
  } else if (hasMessage(e)) {
    return e.message;
  } else {
    return String(e ?? 'no error message.');
  }
}
