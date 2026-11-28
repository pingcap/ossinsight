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

export type OperatorCapability = 'metrics:read' | 'schema:read' | 'pipeline:backfill';
export interface OperatorAccessConfig extends OperatorTokenConfig {grants?: string}
export type OperatorAccessResult = OperatorTokenResult | {status: 'accepted'; fingerprint: string; holder: string};

interface VerifiedGrant {
  holder: string;
  hash: Buffer;
  expires: number;
}

/** Parse deployment grants once. The deployment stores token digests, never raw grant tokens. */
export function createCapabilityVerifier(config: OperatorAccessConfig, scope: OperatorCapability, now = Date.now):
    (authorization: unknown) => OperatorAccessResult {
  const unavailable = (): OperatorAccessResult => ({status: 'unconfigured'});
  if (config.grants === undefined) {
    // Older deployments keep metrics access during migration. Privileged scopes require an explicit grant.
    return scope === 'metrics:read' ? createOperatorTokenVerifier(config, now) : unavailable;
  }
  if (typeof config.grants !== 'string' || config.grants.length > 32768) return unavailable;
  let entries: unknown;
  try { entries = JSON.parse(config.grants); } catch { return unavailable; }
  if (!Array.isArray(entries) || !entries.length || entries.length > 64) return unavailable;
  const seen = new Set<string>();
  const legacyMetrics = [config.current, config.previous].filter(validToken).map(token => digest(token).toString('hex'));
  let grants: VerifiedGrant[] = [];
  for (const entry of entries) {
    if (!entry || typeof entry.holder !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,63}$/.test(entry.holder) ||
        !['metrics:read', 'schema:read', 'pipeline:backfill'].includes(entry.scope) ||
        typeof entry.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(entry.sha256) || seen.has(entry.sha256) ||
        (entry.scope !== 'metrics:read' && legacyMetrics.includes(entry.sha256)) ||
        typeof entry.expiresAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(entry.expiresAt)) return unavailable;
    const expires = Date.parse(entry.expiresAt);
    const canonical = entry.expiresAt.includes('.') ? entry.expiresAt : entry.expiresAt.replace('Z', '.000Z');
    if (!Number.isFinite(expires) || new Date(expires).toISOString() !== canonical) return unavailable;
    seen.add(entry.sha256);
    if (entry.scope === scope) grants.push({holder: entry.holder, hash: Buffer.from(entry.sha256, 'hex'), expires});
  }
  if (!grants.length) return unavailable;
  return authorization => {
    // Never reactivate an expired grant after a clock adjustment.
    const instant = now();
    grants = grants.filter(grant => instant < grant.expires);
    if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ') || authorization.length > 512) return {status: 'rejected'};
    const token = authorization.slice(7);
    if (!validToken(token)) return {status: 'rejected'};
    const supplied = digest(token);
    let accepted: VerifiedGrant | undefined;
    for (const grant of grants) {
      if (timingSafeEqual(grant.hash, supplied)) accepted = grant;
    }
    return accepted ? {status: 'accepted', holder: accepted.holder, fingerprint: accepted.hash.toString('hex').slice(0, 12)} : {status: 'rejected'};
  };
}
