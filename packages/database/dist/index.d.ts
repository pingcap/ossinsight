/**
 * Database Connection
 *
 * Unified database connection using Drizzle ORM + mysql2
 */
import { drizzle } from 'drizzle-orm/mysql2';
import { type Pool, type PoolConnection } from 'mysql2/promise';
import * as schema from './schema/index.js';
export interface DatabaseConfig {
    url?: string;
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
    connectionLimit?: number;
    queueLimit?: number;
}
export interface Database {
    pool: Pool;
    drizzle: ReturnType<typeof drizzle<typeof schema>>;
    getConnection(): Promise<PoolConnection>;
    close(): Promise<void>;
}
/**
 * Create database connection
 */
export declare function createDatabase(config?: DatabaseConfig): Database;
/**
 * Get or create global database instance
 */
export declare function getDatabase(config?: DatabaseConfig): Database;
/**
 * Reset global database instance (for testing)
 */
export declare function resetDatabase(): void;
export * from './schema/index.js';
//# sourceMappingURL=index.d.ts.map