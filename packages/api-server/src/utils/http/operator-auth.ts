import {createHash, timingSafeEqual} from 'crypto';
import {APIError} from '../error';

export function authenticateOperatorToken(authorization: unknown, secret?: string): string {
  if (!secret || Buffer.byteLength(secret) < 32 || secret.length > 256) throw new APIError(503, 'Operator access is not configured.');
  if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ') || authorization.length > 512) throw new APIError(401, 'Operator authentication required.');
  const expected = createHash('sha256').update(secret).digest();
  const supplied = createHash('sha256').update(authorization.slice(7)).digest();
  if (!timingSafeEqual(expected, supplied)) throw new APIError(401, 'Operator authentication required.');
  return `operator:${expected.toString('hex').slice(0, 12)}`;
}
