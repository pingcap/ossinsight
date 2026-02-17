/** Standard API response */
export interface ApiResponse<T = unknown> {
  type: 'sql_endpoint';
  data: {
    columns: Array<{ col: string; data_type: string; nullable: boolean }>;
    rows: T[];
    result: {
      code: number;
      message: string;
      start_ms: number;
      end_ms: number;
      latency: string;
      row_count: number;
      row_affect: number;
      limit: number;
      databases: string[];
    };
  };
}

/** Legacy API response (for backward compatibility) */
export interface LegacyApiResponse<T = unknown> {
  data: T[];
  fields: Array<{ name: string; columnType?: number }>;
  sql?: string;
  requestedAt: string;
  expiresAt?: string;
  spent?: number;
  refresh?: boolean;
}

/** API error response */
export interface ApiError {
  message: string;
  statusCode: number;
  payload?: Record<string, unknown>;
}

/** Health check response */
export interface HealthCheckResponse {
  healthy: boolean;
  isTiDBHealthy: boolean;
  isRedisHealthy: boolean;
  version: string;
  uptime: number;
}

/** Pagination params */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/** Paginated response */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Rate limit info (from response headers) */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  limitMinute: number;
  remainingMinute: number;
}
