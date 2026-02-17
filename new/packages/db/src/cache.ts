import { Pool } from 'mysql2/promise';
import pino from 'pino';

export interface CacheEntry<T = unknown> {
  key: string;
  data: T;
  createdAt: Date;
  expiresAt: Date;
}

export interface CacheProvider {
  get<T>(key: string): Promise<CacheEntry<T> | null>;
  set<T>(key: string, data: T, ttlHours: number): Promise<void>;
  del(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
}

/**
 * Cache provider that stores results in a TiDB table.
 * Table: query_cache (key VARCHAR, data JSON, created_at DATETIME, expires_at DATETIME)
 */
export class TiDBCacheProvider implements CacheProvider {
  private readonly logger: pino.Logger;

  constructor(
    private readonly pool: Pool,
    private readonly keyPrefix: string = '',
    parentLogger?: pino.Logger,
  ) {
    this.logger = (parentLogger || pino()).child({ module: 'tidb-cache' });
  }

  private prefixedKey(key: string): string {
    return this.keyPrefix ? `${this.keyPrefix}:${key}` : key;
  }

  async get<T>(key: string): Promise<CacheEntry<T> | null> {
    const prefixed = this.prefixedKey(key);
    const [rows] = await this.pool.execute(
      'SELECT cache_key, cache_value, created_at, expires_at FROM query_cache WHERE cache_key = ? AND expires_at > NOW()',
      [prefixed],
    );
    const results = rows as any[];
    if (results.length === 0) return null;

    const row = results[0];
    return {
      key: row.cache_key,
      data: JSON.parse(row.cache_value) as T,
      createdAt: new Date(row.created_at),
      expiresAt: new Date(row.expires_at),
    };
  }

  async set<T>(key: string, data: T, ttlHours: number): Promise<void> {
    const prefixed = this.prefixedKey(key);
    const jsonData = JSON.stringify(data);
    await this.pool.execute(
      `INSERT INTO query_cache (cache_key, cache_value, created_at, expires_at)
       VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? HOUR))
       ON DUPLICATE KEY UPDATE cache_value = ?, expires_at = DATE_ADD(NOW(), INTERVAL ? HOUR)`,
      [prefixed, jsonData, ttlHours, jsonData, ttlHours],
    );
    this.logger.debug({ key: prefixed, ttlHours }, 'Cache entry set');
  }

  async del(key: string): Promise<void> {
    const prefixed = this.prefixedKey(key);
    await this.pool.execute('DELETE FROM query_cache WHERE cache_key = ?', [prefixed]);
  }

  async has(key: string): Promise<boolean> {
    const entry = await this.get(key);
    return entry !== null;
  }
}
