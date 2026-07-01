import { connect } from '@tidbcloud/serverless';

let cachedTiDBConnection: ReturnType<typeof connect> | undefined;

export function getOssInsightDatabase() {
  return process.env.OSSINSIGHT_DATABASE || 'gharchive_dev';
}

export function getDatabaseUrl() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error('Missing DATABASE_URL for OSSInsight TiDB connection.');
  }

  try {
    const parsed = new URL(url);
    if (!parsed.hostname) {
      throw new TypeError('DATABASE_URL must include a host.');
    }
  } catch {
    throw new Error('Invalid DATABASE_URL for OSSInsight TiDB connection.');
  }

  return url;
}

export function getTiDBConnection() {
  if (!cachedTiDBConnection) {
    cachedTiDBConnection = createTiDBConnection();
  }
  return cachedTiDBConnection;
}

export function createTiDBConnection() {
  return connect({
    url: getDatabaseUrl(),
    database: getOssInsightDatabase(),
  });
}
