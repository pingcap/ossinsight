/**
 * Database Connection
 *
 * Unified database connection using Drizzle ORM + mysql2
 */
import { drizzle } from 'drizzle-orm/mysql2';
import { createPool } from 'mysql2/promise';
import * as schema from './schema/index.js';
let globalDb = null;
/**
 * Parse database URL
 * Format: mysql://user:password@host:port/database
 */
function parseDatabaseUrl(url) {
    const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:/]+):(\d+)\/([^?]+)(?:\?(.*))?/);
    if (!match) {
        throw new Error(`Invalid database URL: ${url}`);
    }
    const [, user, password, host, port, database, params] = match;
    return {
        host,
        port: parseInt(port, 10),
        user,
        password,
        database,
    };
}
/**
 * Create database connection
 */
export function createDatabase(config) {
    const dbConfig = config || {
        url: process.env.DATABASE_URL ||
            process.env.BACKGROUND_DATABASE_URL ||
            'mysql://root@localhost:3306/ossinsight',
    };
    // Parse URL if provided
    let connectionConfig = dbConfig;
    if (dbConfig.url) {
        const parsed = parseDatabaseUrl(dbConfig.url);
        connectionConfig = { ...dbConfig, ...parsed };
    }
    // Create mysql2 pool
    const pool = createPool({
        host: connectionConfig.host,
        port: connectionConfig.port || 3306,
        user: connectionConfig.user || 'root',
        password: connectionConfig.password || '',
        database: connectionConfig.database || 'ossinsight',
        connectionLimit: connectionConfig.connectionLimit || 20,
        queueLimit: connectionConfig.queueLimit || 0,
        enableKeepAlive: true,
        // TiDB Cloud SSL support
        ssl: connectionConfig.url?.includes('rejectUnauthorized')
            ? { rejectUnauthorized: true }
            : undefined,
    });
    // Create Drizzle ORM instance
    const db = drizzle(pool, { schema, mode: 'default' });
    return {
        pool,
        drizzle: db,
        async getConnection() {
            return pool.getConnection();
        },
        async close() {
            await pool.end();
        },
    };
}
/**
 * Get or create global database instance
 */
export function getDatabase(config) {
    if (!globalDb) {
        globalDb = createDatabase(config);
    }
    return globalDb;
}
/**
 * Reset global database instance (for testing)
 */
export function resetDatabase() {
    globalDb = null;
}
// Re-export schema for convenience
export * from './schema/index.js';
//# sourceMappingURL=index.js.map