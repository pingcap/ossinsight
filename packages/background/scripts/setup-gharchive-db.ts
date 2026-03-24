/**
 * Setup database tables for GHArchive ETL
 * 
 * Creates:
 * - import_logs: Track import job status (migrated from Ruby ETL)
 * - github_events: Main events table (if not exists)
 */

import { createPool } from 'mysql2/promise';

async function main() {
  const dbUrl = process.env.BACKGROUND_DATABASE_URL || 
                process.env.DATABASE_URL ||
                'mysql://root@localhost:3306/ossinsight';

  console.log('Setting up GHArchive ETL tables...');
  console.log('Database:', dbUrl.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@'));

  const pool = createPool({ uri: dbUrl });

  try {
    // Create import_logs table (from Ruby ETL schema)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS import_logs (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        start_batch_at DATETIME(3) NOT NULL,
        start_download_at DATETIME(3) NULL,
        end_download_at DATETIME(3) NULL,
        start_import_at DATETIME(3) NULL,
        end_import_at DATETIME(3) NULL,
        status VARCHAR(50) DEFAULT 'pending',
        error_message TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_filename (filename),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ import_logs table ready');

    // Create github_events table (from Ruby ETL schema)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS github_events (
        id BIGINT NOT NULL DEFAULT 0,
        type VARCHAR(29) NOT NULL DEFAULT 'Event',
        actor_id BIGINT NOT NULL DEFAULT 0,
        actor_login VARCHAR(40) NOT NULL DEFAULT '',
        repo_id BIGINT NOT NULL DEFAULT 0,
        repo_name VARCHAR(140) NOT NULL DEFAULT '',
        org_id BIGINT NOT NULL DEFAULT 0,
        org_login VARCHAR(40) NOT NULL DEFAULT '',
        created_at DATETIME NOT NULL DEFAULT '1970-01-01 00:00:00',
        
        -- Parsed fields
        language VARCHAR(26) NOT NULL DEFAULT '',
        additions BIGINT NOT NULL DEFAULT 0,
        deletions BIGINT NOT NULL DEFAULT 0,
        action VARCHAR(11) NOT NULL DEFAULT '',
        number INT NOT NULL DEFAULT 0,
        commit_id VARCHAR(40) NOT NULL DEFAULT '',
        comment_id BIGINT NOT NULL DEFAULT 0,
        state VARCHAR(6) NOT NULL DEFAULT '',
        closed_at DATETIME NOT NULL DEFAULT '1970-01-01 00:00:00',
        comments INT NOT NULL DEFAULT 0,
        pr_merged BOOLEAN NOT NULL DEFAULT FALSE,
        pr_merged_at DATETIME NOT NULL DEFAULT '1970-01-01 00:00:00',
        pr_changed_files INT NOT NULL DEFAULT 0,
        pr_review_comments INT NOT NULL DEFAULT 0,
        pr_or_issue_id BIGINT NOT NULL DEFAULT 0,
        push_size INT NOT NULL DEFAULT 0,
        push_distinct_size INT NOT NULL DEFAULT 0,
        creator_user_id BIGINT NOT NULL DEFAULT 0,
        creator_user_login VARCHAR(40) NOT NULL DEFAULT '',
        pr_or_issue_created_at DATETIME NOT NULL DEFAULT '1970-01-01 00:00:00',
        
        -- Computed date fields
        event_day DATE NOT NULL,
        event_month DATE NOT NULL,
        event_year INT NOT NULL,
        
        -- Indexes (matching Ruby ETL)
        PRIMARY KEY (id),
        INDEX idx_actor_login (actor_login),
        INDEX idx_repo_name (repo_name),
        INDEX idx_created_at (created_at),
        INDEX idx_event_day (event_day),
        INDEX idx_actor_id_type_action (actor_id, type, action, created_at, repo_id, push_distinct_size),
        INDEX idx_creator_id_type_action (creator_user_id, type, action, pr_merged, created_at, additions, deletions),
        INDEX idx_org_id_type_action (org_id, type, action, created_at, number, push_distinct_size, push_size),
        INDEX idx_org_id_type_action_month (org_id, type, action, event_month, actor_login),
        INDEX idx_repo_id_type_action (repo_id, type, action, created_at, number, push_distinct_size, push_size),
        INDEX idx_repo_id_type_action_month (repo_id, type, action, event_month, actor_login),
        INDEX idx_repo_id_type_action_merged (repo_id, type, action, pr_merged, created_at, additions, deletions),
        INDEX idx_org_id_type_action_merged (org_id, type, action, pr_merged, created_at, additions, deletions)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ github_events table ready');

    // Enable TiFlash replica (if using TiDB)
    try {
      await pool.execute('ALTER TABLE import_logs SET TIFLASH REPLICA 1');
      console.log('✓ import_logs TiFlash replica enabled');
    } catch (error: any) {
      if (error.code === 'ER_NOT_SUPPORTED_YET' || error.message.includes('TiFlash')) {
        console.log('ℹ TiFlash not available, skipping replica setup');
      } else {
        throw error;
      }
    }

    try {
      await pool.execute('ALTER TABLE github_events SET TIFLASH REPLICA 1');
      console.log('✓ github_events TiFlash replica enabled');
    } catch (error: any) {
      if (error.code === 'ER_NOT_SUPPORTED_YET' || error.message.includes('TiFlash')) {
        console.log('ℹ TiFlash not available, skipping replica setup');
      } else {
        throw error;
      }
    }

    console.log('\n✅ GHArchive ETL setup complete!');
    console.log('\nNext steps:');
    console.log('1. Start scheduler: pnpm start');
    console.log('2. Start worker: pnpm worker');
    console.log('3. Import hourly data:');
    console.log('   node -e "const { getBackgroundService } = require(\'./dist/index.js\');');
    console.log('   const s = getBackgroundService();');
    console.log('   s.enqueue(\'gharchive.import.hourly\', { date: \'2026-03-23\', hour: 12 });"');

  } finally {
    await pool.end();
  }
}

main().catch(console.error);
