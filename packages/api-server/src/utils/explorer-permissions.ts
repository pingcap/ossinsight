import {Pool, RowDataPacket} from 'mysql2/promise';

type ExplorerPermission = 'curate_questions' | 'extended_model_quota';

export async function hasExplorerPermission(
  pool: Pick<Pool, 'query'>, userId: number, permission: ExplorerPermission,
): Promise<boolean> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT 1 FROM explorer_user_permissions WHERE user_id = ? AND permission = ? LIMIT 1',
    [userId, permission],
  );
  return rows.length > 0;
}
