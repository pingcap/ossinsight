/**
 * Query Prefetch Tasks
 *
 * Handles intelligent query caching and pre-execution
 */
import type { Orbital } from '@mini256/orbital';
export interface PrefetchQueryData {
    queryId: string;
    query: string;
    params?: Record<string, unknown>;
    ttl?: number;
    priority?: number;
}
export interface PrefetchCacheData {
    cacheKey: string;
    strategy: 'lru' | 'lfu' | 'fifo';
    ttl?: number;
}
export declare function registerPrefetchTasks(scheduler: Orbital): void;
//# sourceMappingURL=prefetch.d.ts.map