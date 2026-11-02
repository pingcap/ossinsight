import {randomUUID} from 'crypto';
const unknownPools = new WeakMap<object, string>();

/** Logical source identity, without passwords; opaque pools never share caches. */
export function databaseCacheIdentity(pool: unknown) {
  const candidate = pool as any;
  const config = candidate?.pool?.config?.connectionConfig || candidate?.config?.connectionConfig;
  if (config?.host && config?.database) {
    return [config.host, config.port || 3306, config.database, config.user || '', config.charsetNumber || ''];
  }
  if (!pool || typeof pool !== 'object') return 'unconfigured';
  if (!unknownPools.has(pool)) unknownPools.set(pool, randomUUID());
  return unknownPools.get(pool)!;
}
