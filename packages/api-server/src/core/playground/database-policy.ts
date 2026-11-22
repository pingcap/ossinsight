import { validateAnalyticsGrants } from '@ossinsight/sql-policy';
export { validateAnalyticsGrants } from '@ossinsight/sql-policy';

export async function checkAnalyticsDatabase(pool: { query: Function }): Promise<void> {
  const [databases] = await pool.query('SELECT DATABASE() AS databaseName');
  const [rows] = await pool.query('SHOW GRANTS FOR CURRENT_USER');
  validateAnalyticsGrants(databases[0]?.databaseName, rows.map((row: Record<string, string>) => Object.values(row)[0]));
}
