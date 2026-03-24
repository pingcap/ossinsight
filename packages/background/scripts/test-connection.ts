#!/usr/bin/env tsx

/**
 * Test TiDB Cloud Connection
 */

import mysql from 'mysql2/promise';

const CONFIG = {
  host: 'gateway01.us-west-2.prod.aws.tidbcloud.com',
  port: 4000,
  user: 'e82Anu4yeQBb47c.root',
  password: '4GTivTLWlPbalFTl',
  ssl: {
    rejectUnauthorized: true,
  },
};

async function testConnection(): Promise<void> {
  console.log('🔍 Testing TiDB Cloud Connection\n');
  console.log(`Host: ${CONFIG.host}:${CONFIG.port}`);
  console.log(`User: ${CONFIG.user}\n`);

  // Test 1: Connect without database
  console.log('Test 1: Connecting without database...');
  try {
    const conn1 = await mysql.createConnection({
      ...CONFIG,
      database: undefined,
    });
    
    const [dbs]: any = await conn1.query('SHOW DATABASES');
    console.log('✅ Connected!\n');
    console.log('Available databases:');
    dbs.forEach((db: any) => {
      const dbName = Object.values(db)[0];
      if (!['information_schema', 'mysql', 'performance_schema'].includes(dbName)) {
        console.log(`  - ${dbName}`);
      }
    });
    
    await conn1.end();
  } catch (error: any) {
    console.log('❌ Failed:', error.message);
  }

  console.log('\n---\n');

  // Test 2: Connect to gharchive_dev
  console.log('Test 2: Connecting to gharchive_dev...');
  try {
    const conn2 = await mysql.createConnection({
      ...CONFIG,
      database: 'gharchive_dev',
    });
    
    const [tables]: any = await conn2.query('SHOW TABLES');
    console.log('✅ Connected!');
    console.log(`   Tables: ${tables.length}`);
    
    // Test write permission
    try {
      await conn2.query('CREATE TABLE IF NOT EXISTS _test_write (id INT)');
      console.log('   ✅ Write test: SUCCESS (can create tables)');
      await conn2.query('DROP TABLE IF EXISTS _test_write');
      console.log('   ✅ Cleanup: SUCCESS');
    } catch (writeError: any) {
      console.log(`   ❌ Write test: FAILED - ${writeError.message}`);
    }
    
    await conn2.end();
  } catch (error: any) {
    console.log('❌ Failed:', error.message);
  }

  console.log('\n---\n');

  // Test 3: Connect to ossinsight
  console.log('Test 3: Connecting to ossinsight...');
  try {
    const conn3 = await mysql.createConnection({
      ...CONFIG,
      database: 'ossinsight',
    });
    
    console.log('✅ Connected!');
    
    const [tables]: any = await conn3.query('SHOW TABLES');
    console.log(`   Tables: ${tables.length}`);
    
    await conn3.end();
  } catch (error: any) {
    console.log('❌ Failed:', error.message);
    console.log('   (Database may not exist yet)');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Connection test complete!\n');
}

testConnection().catch(console.error);
