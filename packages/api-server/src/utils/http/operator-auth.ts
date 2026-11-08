import {createOperatorTokenVerifier, OperatorTokenConfig} from '@ossinsight/types/dist/operator-token';
import {APIError} from '../error';

export type OperatorCredentials = string | OperatorTokenConfig | undefined;

export function createOperatorAuthenticator(credentials: OperatorCredentials) {
  const verify = createOperatorTokenVerifier(typeof credentials === 'object' ? credentials : {current: credentials});
  return (authorization: unknown): string => {
    const result = verify(authorization);
    if (result.status === 'unconfigured') throw new APIError(503, 'Operator access is not configured.');
    if (result.status !== 'accepted') throw new APIError(401, 'Operator authentication required.');
    return `operator:${result.fingerprint}`;
  };
}

export function operationsCredentials(config: {
  OPERATIONS_TOKEN?: string;
  OPERATIONS_TOKEN_PREVIOUS?: string;
  OPERATIONS_TOKEN_PREVIOUS_EXPIRES_AT?: string;
}): OperatorTokenConfig {
  return {current: config.OPERATIONS_TOKEN, previous: config.OPERATIONS_TOKEN_PREVIOUS,
    previousExpiresAt: config.OPERATIONS_TOKEN_PREVIOUS_EXPIRES_AT};
}

// Preserve the current-only helper for callers; runtime routes capture a verifier once.
export function authenticateOperatorToken(authorization: unknown, secret?: string): string {
  return createOperatorAuthenticator(secret)(authorization);
}
