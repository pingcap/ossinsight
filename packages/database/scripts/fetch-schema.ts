/**
 * Fetch all table schemas from ossinsight database
 */

import { createPool } from 'mysql2/promise';

async function main() {
  const databaseUrl = process.env.DATABASE_URL || 
                      'mysql://e82Anu4yeQBb47c.root:4GTivTLWlPbalFTl@gateway01.us-west-2.prod.aws.tidbcloud.com:4000/ossinsight?ssl={"rejectUnauthorized":true}';

  const pool = createPool({
    uri: databaseUrl,
    connectionLimit: 1,
  });

  try {
    // Get all tables (excluding mv_ tables)
    const [tables] = await pool.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'ossinsight' 
        AND table_name NOT LIKE 'mv_%'
      ORDER BY table_name
    `);

    console.log('=== Tables ===');
    for (const table of tables as any[]) {
      console.log(table.table_name);
    }

    // Get schema for each table
    for (const table of tables as any[]) {
      const tableName = table.table_name;
      console.log(`\n=== ${tableName} ===`);

      // Get columns
      const [columns] = await pool.execute(`
        SELECT 
          column_name,
          data_type,
          column_type,
          is_nullable,
          column_default,
          column_key,
          extra
        FROM information_schema.columns
        WHERE table_schema = 'ossinsight'
          AND table_name = ?
        ORDER BY ordinal_position
      `, [tableName]);

      console.log('-- Columns');
      for (const col of columns as any[]) {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default !== null ? `DEFAULT '${col.column_default}'` : '';
        const key = col.column_key === 'PRI' ? 'PRIMARY KEY' : '';
        const extra = col.extra ? col.extra : '';
        console.log(`  ${col.column_name}: ${col.column_type} ${nullable} ${defaultVal} ${key} ${extra}`);
      }

      // Get indexes
      const [indexes] = await pool.execute(`
        SHOW INDEX FROM \`${tableName}\`
      `, [tableName]);

      console.log('-- Indexes');
      const indexMap = new Map<string, any[]>();
      for (const idx of indexes as any[]) {
        if (!indexMap.has(idx.Key_name)) {
          indexMap.set(idx.Key_name, []);
        }
        indexMap.get(idx.Key_name)!.push(idx);
      }

      for (const [indexName, cols] of indexMap.entries()) {
        if (indexName === 'PRIMARY') continue;
        const unique = cols[0].Non_unique === 0 ? 'UNIQUE' : '';
        const colNames = cols.map(c => c.Column_name).join(', ');
        console.log(`  ${unique} INDEX ${indexName} (${colNames})`);
      }
    }

  } finally {
    await pool.end();
  }
}

main().catch(console.error);
