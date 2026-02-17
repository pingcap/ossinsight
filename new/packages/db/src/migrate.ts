import { createPool } from './pool.js';
import pino from 'pino';

const logger = pino({ name: 'ossinsight-migrate' });

const MIGRATIONS = [
  {
    name: '001_create_query_cache',
    sql: `
      CREATE TABLE IF NOT EXISTS query_cache (
        cache_key VARCHAR(512) NOT NULL PRIMARY KEY,
        cache_value LONGTEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        INDEX idx_expires_at (expires_at)
      );
    `,
  },
  {
    name: '002_create_collections',
    sql: `
      CREATE TABLE IF NOT EXISTS collections (
        id BIGINT NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        past_month_visits INT DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `,
  },
  {
    name: '003_create_collection_items',
    sql: `
      CREATE TABLE IF NOT EXISTS collection_items (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        collection_id BIGINT NOT NULL,
        repo_id BIGINT NOT NULL,
        repo_name VARCHAR(255) NOT NULL,
        INDEX idx_collection_id (collection_id),
        INDEX idx_repo_id (repo_id)
      );
    `,
  },
  {
    name: '004_create_pipeline_executions',
    sql: `
      CREATE TABLE IF NOT EXISTS pipeline_executions (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        pipeline_name VARCHAR(255) NOT NULL,
        status ENUM('idle', 'running', 'success', 'error') NOT NULL DEFAULT 'idle',
        started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        finished_at DATETIME,
        error TEXT,
        rows_affected INT DEFAULT 0,
        INDEX idx_pipeline_name (pipeline_name),
        INDEX idx_started_at (started_at)
      );
    `,
  },
  {
    name: '005_create_task_executions',
    sql: `
      CREATE TABLE IF NOT EXISTS task_executions (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        task_id VARCHAR(255) NOT NULL,
        task_name VARCHAR(255) NOT NULL,
        task_type ENUM('prefetch', 'pipeline', 'sync') NOT NULL,
        status ENUM('pending', 'queued', 'running', 'success', 'error', 'cancelled', 'timeout') NOT NULL DEFAULT 'pending',
        priority TINYINT NOT NULL DEFAULT 1,
        started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        finished_at DATETIME,
        error TEXT,
        metadata JSON,
        INDEX idx_task_id (task_id),
        INDEX idx_task_type (task_type),
        INDEX idx_status (status),
        INDEX idx_started_at (started_at)
      );
    `,
  },
  {
    name: '006_create_scheduled_tasks',
    sql: `
      CREATE TABLE IF NOT EXISTS scheduled_tasks (
        id VARCHAR(255) NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type ENUM('prefetch', 'pipeline', 'sync') NOT NULL,
        cron VARCHAR(100) NOT NULL,
        enabled BOOLEAN NOT NULL DEFAULT TRUE,
        config JSON NOT NULL,
        priority TINYINT NOT NULL DEFAULT 1,
        timeout INT NOT NULL DEFAULT 300000,
        last_run DATETIME,
        last_status VARCHAR(50),
        next_run DATETIME,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_type (type),
        INDEX idx_enabled (enabled)
      );
    `,
  },
  {
    name: '007_create_migrations_table',
    sql: `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name VARCHAR(255) NOT NULL PRIMARY KEY,
        applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },
];

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    logger.error('DATABASE_URL is required');
    process.exit(1);
  }

  const pool = createPool({ url: databaseUrl });

  // Ensure migrations table exists
  await pool.execute(MIGRATIONS.find((m) => m.name === '007_create_migrations_table')!.sql);

  for (const migration of MIGRATIONS) {
    const [rows] = await pool.execute(
      'SELECT name FROM schema_migrations WHERE name = ?',
      [migration.name],
    );
    if ((rows as any[]).length > 0) {
      logger.info({ migration: migration.name }, 'Already applied, skipping');
      continue;
    }

    logger.info({ migration: migration.name }, 'Applying migration');
    await pool.execute(migration.sql);
    await pool.execute('INSERT INTO schema_migrations (name) VALUES (?)', [migration.name]);
    logger.info({ migration: migration.name }, 'Migration applied');
  }

  await pool.end();
  logger.info('All migrations complete');
}

migrate().catch((err) => {
  logger.error(err, 'Migration failed');
  process.exit(1);
});
