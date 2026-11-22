import {Pool} from 'mysql2/promise';
import {CachedResult} from '../../cache/Cache';
import {APIError} from '../../../utils/error';

// These catalog queries cache analytics, but their collection projections must
// reflect revocation/rename/removal on every response, including old cache hits.
const PROJECTED_QUERIES = new Set(['trending-repos', 'get-repo-collections', 'recent-hot-collections']);
export const hasCollectionProjection = (name: string) => PROJECTED_QUERIES.has(name);

export async function refreshCollectionProjection(
  pool: Pool, name: string, result: CachedResult<any>, params: Record<string, any>,
): Promise<CachedResult<any>> {
  const unavailable = () => new APIError(503, 'Collection metadata is unavailable.');
  if (!Array.isArray(result.data) || result.data.length > 1000) throw unavailable();
  if (result.data.length === 0) return result;
  const fields = result.fields?.map((field: {name: string}) => field.name);
  const read = (row: any, key: string) => Array.isArray(row) ? row[fields?.indexOf(key) ?? -1] : row?.[key];
  const id = (value: unknown): number => {
    if (!['number', 'string'].includes(typeof value) || !/^[1-9]\d*$/.test(String(value)) ||
        !Number.isSafeInteger(Number(value))) throw unavailable();
    return Number(value);
  };
  const replace = (row: any, updates: Record<string, unknown>) => {
    if (!Array.isArray(row)) return {...row, ...updates};
    const next = [...row];
    for (const [key, value] of Object.entries(updates)) {
      const index = fields?.indexOf(key) ?? -1;
      if (index < 0) throw unavailable();
      next[index] = value;
    }
    return next;
  };
  const placeholders = (values: number[]) => values.map(() => '?').join(',');
  const ids = (key: string) => [...new Set<number>(result.data.map((row: any) => id(read(row, key))))];
  // The timeout and bounded parameter lists keep this a small metadata lookup,
  // not a rerun of the analytics query. Failure must never serve stale names.
  const lookup = async (sql: string, values: number[]) => {
    const [rows] = await pool.execute<any[]>({sql, timeout: 5000}, values);
    return rows;
  };

  if (name === 'trending-repos') {
    const repoIds = ids('repo_id');
    const rows = await lookup(`SELECT /*+ MAX_EXECUTION_TIME(4000) */ ci.repo_id,
      GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ',') AS collection_names
      FROM collection_items ci JOIN collections c ON c.id = ci.collection_id AND c.public = 1
      WHERE ci.deleted_at IS NULL AND ci.repo_id IN (${placeholders(repoIds)}) GROUP BY ci.repo_id`, repoIds);
    const names = new Map(rows.map(row => [String(row.repo_id), row.collection_names]));
    return {...result, data: result.data.map((row: any) => replace(row, {
      collection_names: names.get(String(read(row, 'repo_id'))) ?? null,
    }))};
  }

  const collectionIds = ids('id');
  if (name === 'get-repo-collections') {
    const rows = await lookup(`SELECT /*+ MAX_EXECUTION_TIME(4000) */ DISTINCT c.id, c.name
      FROM collections c JOIN collection_items ci ON ci.collection_id = c.id
      WHERE c.public = 1 AND ci.deleted_at IS NULL AND ci.repo_id = ?
      AND c.id IN (${placeholders(collectionIds)})`, [id(params.repoId), ...collectionIds]);
    const names = new Map(rows.map(row => [String(row.id), row.name]));
    return {...result, data: result.data.filter((row: any) => names.has(String(read(row, 'id'))))
      .map((row: any) => replace(row, {name: names.get(String(read(row, 'id')))}))};
  }

  if (name !== 'recent-hot-collections') throw unavailable();
  const repoIds = ids('repo_id');
  const rows = await lookup(`SELECT /*+ MAX_EXECUTION_TIME(4000) */ c.id, c.name, ci.repo_id, ci.repo_name
    FROM collections c JOIN collection_items ci ON ci.collection_id = c.id
    WHERE c.public = 1 AND ci.deleted_at IS NULL
    AND c.id IN (${placeholders(collectionIds)}) AND ci.repo_id IN (${placeholders(repoIds)})`, [...collectionIds, ...repoIds]);
  const memberships = new Map(rows.map(row => [`${row.id}:${row.repo_id}`, row]));
  return {...result, data: result.data.flatMap((row: any) => {
    const current = memberships.get(`${read(row, 'id')}:${read(row, 'repo_id')}`);
    return current ? [replace(row, {name: current.name, repo_name: current.repo_name})] : [];
  })};
}
