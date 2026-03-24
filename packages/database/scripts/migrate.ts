/**
 * Database Migration Script
 * 
 * Run pending migrations to sync schema with database
 */

import { drizzle } from 'drizzle-orm/mysql2';
import { createPool } from 'mysql2/promise';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import * as schema from './schema/index.js';

async function main() {
  const databaseUrl = process.env.DATABASE_URL || 
                      process.env.BACKGROUND_DATABASE_URL ||
                      'mysql://root@localhost:3306/ossinsight';

  console.log('Running database migrations...');
  console.log('Database:', databaseUrl.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@'));

  // Parse database URL
  const match = databaseUrl.match(
    /mysql:\/\/([^:]+):([^@]+)@([^:/]+):(\d+)\/([^?]+)(?:\?(.*))?/
  );
  
  if (!match) {
    throw new Error(`Invalid database URL: ${databaseUrl}`);
  }

  const [, user, password, host, port, database] = match;

  // Create connection
  const pool = createPool({
    host,
    port: parseInt(port, 10),
    user,
    password,
    database,
    connectionLimit: 1,
    ssl: databaseUrl.includes('rejectUnauthorized') 
      ? { rejectUnauthorized: true } 
      : false,
  });

  try {
    const db = drizzle(pool, { schema, mode: 'default' });

    // Run migrations
    await migrate(db, { migrationsFolder: './migrations' });

    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
