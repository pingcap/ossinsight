export interface HealthSnapshot {
  healthy: boolean;
  isTiDBHealthy?: boolean;
  isRedisHealthy?: boolean;
  isShadowTiDBHealthy?: boolean;
}

/** A stuck dependency retains its single probe; HTTP deadlines never launch replacements. */
export function cachedHealth(check: () => Promise<HealthSnapshot>, ttlMs = 5000, timeoutMs = 3000) {
  let pending: Promise<HealthSnapshot> | undefined;
  let cached: HealthSnapshot | undefined;
  let expires = 0;
  return async (): Promise<HealthSnapshot> => {
    if (cached && Date.now() < expires) return cached;
    if (!pending) {
      pending = Promise.resolve().then(check).catch(() => ({healthy: false})).finally(() => {pending = undefined;});
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      cached = await Promise.race([
        pending,
        new Promise<HealthSnapshot>(resolve => {timer = setTimeout(() => resolve({healthy: false}), timeoutMs);}),
      ]);
      expires = Date.now() + ttlMs;
      return cached;
    } finally {clearTimeout(timer);}
  };
}
