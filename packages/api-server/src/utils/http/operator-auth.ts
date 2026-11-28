import {createCapabilityVerifier, OperatorAccessConfig, OperatorCapability} from '@ossinsight/types/dist/operator-token';
import {APIError} from '../error';

export type OperatorCredentials = string | OperatorAccessConfig | undefined;

export function createOperatorAuthenticator(credentials: OperatorCredentials, scope: OperatorCapability = 'metrics:read') {
  const verify = createCapabilityVerifier(typeof credentials === 'object' ? credentials : {current: credentials}, scope);
  return (authorization: unknown): string => {
    const result = verify(authorization);
    if (result.status === 'unconfigured') throw new APIError(503, 'Operator access is not configured.');
    if (result.status !== 'accepted') throw new APIError(401, 'Operator authentication required.');
    return 'holder' in result ? `operator:${result.holder}:${result.fingerprint}` : `operator:${result.fingerprint}`;
  };
}

export function operationsCredentials(config: {
  OPERATIONS_GRANTS?: string;
  OPERATIONS_TOKEN?: string;
  OPERATIONS_TOKEN_PREVIOUS?: string;
  OPERATIONS_TOKEN_PREVIOUS_EXPIRES_AT?: string;
}): OperatorAccessConfig {
  return {grants: config.OPERATIONS_GRANTS, current: config.OPERATIONS_TOKEN, previous: config.OPERATIONS_TOKEN_PREVIOUS,
    previousExpiresAt: config.OPERATIONS_TOKEN_PREVIOUS_EXPIRES_AT};
}

// Preserve the current-only helper for callers; runtime routes capture a verifier once.
export function authenticateOperatorToken(authorization: unknown, secret?: string): string {
  return createOperatorAuthenticator(secret)(authorization);
}
