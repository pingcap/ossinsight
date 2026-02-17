/** Query parameter definition */
export interface QueryParam {
  name: string;
  description?: string;
  type?: 'array' | 'string' | 'number' | 'boolean' | 'integer';
  itemType?: 'string' | 'number' | 'boolean' | 'integer';
  maxArrayLength?: number;
  column?: string;
  dateRangeTo?: 'now' | 'last-valid-datetime';
  replaces: string;
  template?: Record<string, string>;
  default?: string | number;
  enums?: string | string[];
  pattern?: string;
}

/** Persist configuration for query results */
export interface PersistConfig {
  tableName: string;
  series: Array<{ name: string; expression?: string }>;
  fields: Array<{ name: string; expression?: string }>;
}

/** Conditional refresh cron */
export interface ConditionalRefreshCrons {
  param: string;
  on: Record<string, string>;
}

/** Cache provider types */
export type CacheProviderType = 'NORMAL_TABLE' | 'CACHED_TABLE';

/** Query schema - matches params.json format */
export interface QuerySchema {
  name?: string;
  engine?: 'legacy' | 'liquid';
  public?: boolean;
  deprecated?: boolean;
  description?: string;
  cacheProvider?: CacheProviderType;
  cacheHours: number;
  refreshQueue?: string;
  refreshCron?: string | ConditionalRefreshCrons;
  onlyFromCache?: boolean;
  params: QueryParam[];
  persist?: PersistConfig;
  resultSchema?: Record<string, unknown>;
}

/** Cached query result */
export interface CachedData<T = unknown> {
  data: T[];
  fields: FieldInfo[];
  sql?: string;
  requestedAt: string;
  expiresAt?: string;
  spent?: number;
  refresh?: boolean;
  fromCache?: boolean;
}

/** Result field info */
export interface FieldInfo {
  name: string;
  columnType?: number;
}
