/**
 * Drizzle Kit Configuration
 * 
 * Used for:
 * - pnpm generate: Generate SQL migrations from schema
 * - pnpm migrate: Run migrations
 * - pnpm studio: Open Drizzle Studio
 */

import type { Config } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL || 
                    process.env.BACKGROUND_DATABASE_URL ||
                    'mysql://root@localhost:3306/ossinsight';

export default {
  schema: './src/schema/index.ts',
  out: './migrations',
  dialect: 'mysql',
  dbCredentials: {
    url: databaseUrl,
  },
  tablesFilter: ['gharchive_dev.*'],
  verbose: true,
  strict: true,
} satisfies Config;
