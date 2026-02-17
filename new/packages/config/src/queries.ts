import { readFile, readdir, access } from 'node:fs/promises';
import { join } from 'node:path';
import type { QuerySchema } from '@ossinsight/types';
import pino from 'pino';

const logger = pino({ name: 'config-queries' });

export const QUERY_CONFIG_FILENAME = 'params.json';
export const QUERY_TEMPLATE_SQL_FILENAME = 'template.sql';
export const QUERY_PRESET_FILENAME = 'params-preset.json';

export interface LoadedQuery {
  name: string;
  schema: QuerySchema;
  templateSql: string;
}

/**
 * Load all query definitions from configs/queries directory.
 */
export async function loadQueries(configsPath: string): Promise<Map<string, LoadedQuery>> {
  const queriesDir = join(configsPath, 'queries');
  const entries = await readdir(queriesDir, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory());

  const queries = new Map<string, LoadedQuery>();

  for (const dir of dirs) {
    try {
      const query = await loadQuery(configsPath, dir.name);
      if (query) {
        queries.set(dir.name, query);
      }
    } catch (error) {
      logger.error({ query: dir.name, error }, 'Failed to load query config');
    }
  }

  logger.info({ count: queries.size }, 'Queries loaded');
  return queries;
}

/**
 * Load a single query by name.
 */
export async function loadQuery(
  configsPath: string,
  queryName: string,
): Promise<LoadedQuery | null> {
  const queryDir = join(configsPath, 'queries', queryName);

  const configPath = join(queryDir, QUERY_CONFIG_FILENAME);
  const sqlPath = join(queryDir, QUERY_TEMPLATE_SQL_FILENAME);

  try {
    await access(configPath);
    await access(sqlPath);
  } catch {
    return null;
  }

  const configContent = await readFile(configPath, 'utf-8');
  const schema = JSON.parse(configContent) as QuerySchema;
  const templateSql = await readFile(sqlPath, 'utf-8');

  return { name: queryName, schema, templateSql };
}

/**
 * Load query parameter presets.
 */
export async function loadPresets(
  configsPath: string,
): Promise<Record<string, string[]>> {
  const presetPath = join(configsPath, QUERY_PRESET_FILENAME);
  try {
    const content = await readFile(presetPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}
