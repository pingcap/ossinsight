// Server-only entrypoint. Do not re-export Node crypto from the browser barrel.
import {createHash, timingSafeEqual} from 'crypto';

export interface OperatorTokenConfig {
  current?: string;
  previous?: string;
  previousExpiresAt?: string;
}

export type OperatorTokenResult = {status: 'accepted'; fingerprint: string} |
  {status: 'unconfigured' | 'rejected'};

const MAX_OVERLAP_MS = 24 * 60 * 60 * 1000;
const digest = (value: string) => createHash('sha256').update(value).digest();
const validToken = (value: unknown): value is string => typeof value === 'string' &&
  Buffer.byteLength(value) >= 32 && value.length <= 256 && !/[\s\x00-\x1f\x7f]/.test(value);

/** Capture policy once at startup; an invalid future window cannot age into validity. */
export function createOperatorTokenVerifier(config: OperatorTokenConfig,
  now: () => number = Date.now): (authorization: unknown) => OperatorTokenResult {
  const invalid = (): OperatorTokenResult => ({status: 'unconfigured'});
  if (!validToken(config.current)) return invalid;
  const current = digest(config.current);
  let previous = current;
  let deadline = 0;
  let previousActive = false;
  if (config.previous !== undefined || config.previousExpiresAt !== undefined) {
    if (!validToken(config.previous) || typeof config.previousExpiresAt !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(config.previousExpiresAt)) return invalid;
    deadline = Date.parse(config.previousExpiresAt);
    const normalized = config.previousExpiresAt.replace(/Z$/, '.000Z');
    const canonical = config.previousExpiresAt.includes('.') ? config.previousExpiresAt : normalized;
    if (!Number.isFinite(deadline) || new Date(deadline).toISOString() !== canonical ||
      deadline > now() + MAX_OVERLAP_MS) return invalid;
    previous = digest(config.previous);
    if (timingSafeEqual(current, previous)) return invalid;
    previousActive = now() < deadline;
  }
  const currentId = current.toString('hex').slice(0, 12);
  const previousId = previous.toString('hex').slice(0, 12);
  return authorization => {
    // Once expired, do not re-enable the old key if the wall clock moves backward.
    previousActive = previousActive && now() < deadline;
    if (typeof authorization !== 'string' || authorization.length > 512 ||
      !authorization.startsWith('Bearer ')) return {status: 'rejected'};
    const supplied = digest(authorization.slice(7));
    // Always compare both fixed-length digests; do not short-circuit key comparisons.
    const matchesCurrent = timingSafeEqual(current, supplied);
    const matchesPrevious = timingSafeEqual(previous, supplied);
    if (matchesCurrent) return {status: 'accepted', fingerprint: currentId};
    if (matchesPrevious && previousActive) return {status: 'accepted', fingerprint: previousId};
    return {status: 'rejected'};
  };
}
