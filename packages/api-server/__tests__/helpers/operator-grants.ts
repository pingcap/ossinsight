import {createHash} from 'node:crypto';
import type {OperatorCapability} from '@ossinsight/types/dist/operator-token';

export function grant(token: string, scope: OperatorCapability, holder: string, expiresAt = new Date(Date.now() + 60000).toISOString()) {
  return {holder, scope, sha256: createHash('sha256').update(token).digest('hex'), expiresAt};
}
