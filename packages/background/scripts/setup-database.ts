#!/usr/bin/env tsx

/**
 * Database Setup Script for OSS Insight Background Service
 * 
 * Creates Orbital tables in the specified database
 */

import mysql from 'mysql2/promise';

// Parse DATABASE_URL from environment or use default
const DATABASE_URL = process.env.BACKGROUND_DATABASE_URL || 
  'mysql://e82Anu4yeQBb47c.root:4GTivTLWlPbalFTl@gateway01.us-west-2.prod.aws.tidbcloud.com:4000/ossinsight?ssl={"rejectUnauthorized":true}';

// Parse URL
const url = new URL(DATABASE_URL.replace('mysql://', 'mysql://'));
const database = url.pathname.slice(1);

async function setupDatabase(): Promise<void> {
  console.log('🔧 Setting up OSS Insight Background database...\n');
  console.log(`📊 Target database: ${database}`);
  console.log(`🌐 Host: ${url.hostname}:${url.port}\n`);

  // Connect to TiDB
  const connection = await mysql.createConnection({
    host: url.hostname,
    port: parseInt(url.port, 10),
    user: url.username,
    password: url.password,
    database: database,
    ssl: {
      rejectUnauthorized: true,
    },
  });

  try {
    // Test connection
    console.log('🔌 Testing connection...');
    await connection.query('SELECT 1');
    console.log('✅ Connection successful\n');

    // 1. Create Orbital tasks table
    console.log('📋 Creating orbital_tasks table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orbital_tasks (
        id VARCHAR(255) PRIMARY KEY,
        type VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        priority INT DEFAULT 5,
        
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        scheduled_at DATETIME(3) NULL,
        started_at DATETIME(3) NULL,
        completed_at DATETIME(3) NULL,
        
        max_retries INT DEFAULT 3,
        retry_count INT DEFAULT 0,
        retry_delay INT DEFAULT 60,
        
        concurrency_key VARCHAR(255) NULL,
        rate_limit_key VARCHAR(255) NULL,
        
        payload JSON NULL,
        error_message TEXT NULL,
        worker_id VARCHAR(255) NULL,
        
        timeout INT DEFAULT 3600,
        
        INDEX idx_status (status),
        INDEX idx_type (type),
        INDEX idx_scheduled (scheduled_at),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ orbital_tasks table created\n');

    // 2. Create task history table (for analytics)
    console.log('📊 Creating orbital_task_history table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orbital_task_history (
        id VARCHAR(255) PRIMARY KEY,
        task_id VARCHAR(255) NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        event_data JSON NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        
        INDEX idx_task_id (task_id),
        INDEX idx_event_type (event_type),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ orbital_task_history table created\n');

    // 3. Create scheduled_jobs table
    console.log('⏰ Creating orbital_scheduled_jobs table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orbital_scheduled_jobs (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        cron_expression VARCHAR(255) NOT NULL,
        task_type VARCHAR(255) NOT NULL,
        task_data JSON NULL,
        enabled BOOLEAN DEFAULT true,
        last_run_at DATETIME(3) NULL,
        next_run_at DATETIME(3) NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        
        INDEX idx_enabled (enabled),
        INDEX idx_next_run (next_run_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ orbital_scheduled_jobs table created\n');

    // 4. Insert default scheduled jobs (ignore duplicates)
    console.log('📝 Inserting default scheduled jobs...');
    await connection.query(`
      INSERT IGNORE INTO orbital_scheduled_jobs (id, name, cron_expression, task_type, task_data) VALUES
        ('job_github_daily', 'github.daily.full-sync', '0 2 * * *', 'github.sync.events', '{"limit": 10000}'),
        ('job_prefetch_hourly', 'prefetch.hourly.refresh', '0 * * * *', 'prefetch.cache', '{"strategy": "lru"}'),
        ('job_prefetch_daily', 'prefetch.daily.cleanup', '0 3 * * *', 'prefetch.cache', '{"strategy": "cleanup"}'),
        ('job_etl_daily', 'etl.daily.process', '0 1 * * *', 'etl.process', '{"pipelineId": "daily-aggregation"}')
    `);
    console.log('✅ Default scheduled jobs inserted\n');

    // 5. Show table info
    console.log('📊 Verifying tables...');
    const [tables]: any = await connection.query('SHOW TABLES LIKE "orbital_%"');
    console.log(`   Found ${tables.length} orbital tables:\n`);
    tables.forEach((row: any) => {
      const tableName = Object.values(row)[0];
      console.log(`   - ${tableName}`);
    });
    console.log('');

    // 6. Show summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Database setup complete!\n');
    console.log('📊 Configuration:');
    console.log(`   Database: ${database}`);
    console.log(`   Host: ${url.hostname}:${url.port}`);
    console.log('   Tables created: 3');
    console.log('   - orbital_tasks');
    console.log('   - orbital_task_history');
    console.log('   - orbital_scheduled_jobs');
    console.log('   Scheduled jobs: 4');
    console.log('   - github.daily.full-sync (2 AM daily)');
    console.log('   - prefetch.hourly.refresh (every hour)');
    console.log('   - prefetch.daily.cleanup (3 AM daily)');
    console.log('   - etl.daily.process (1 AM daily)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🔗 Update your .env:');
    console.log(`   BACKGROUND_DATABASE_URL=${DATABASE_URL}\n`);

  } catch (error: any) {
    console.error('❌ Database setup failed:', error.message);
    
    if (error.message.includes('Access denied')) {
      console.error('\n💡 Tip: Check your DATABASE_URL credentials.');
      console.error('   TiDB Cloud Serverless uses different user format.');
      console.error('   See: https://docs.pingcap.com/tidbcloud/select-cluster-tier#user-name-prefix');
    }
    
    throw error;
  } finally {
    await connection.end();
  }
}

// Run setup
setupDatabase().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
