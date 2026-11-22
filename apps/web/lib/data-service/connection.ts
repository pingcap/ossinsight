import { connect } from '@tidbcloud/serverless';
import { secureDatabaseURL } from '@ossinsight/types';

let cachedTiDBConnection: ReturnType<typeof connect> | undefined;

export function getOssInsightDatabase() {
  return process.env.OSSINSIGHT_DATABASE || 'gharchive_dev';
}

export function getDatabaseUrl() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error('Missing DATABASE_URL for OSSInsight TiDB connection.');
  }

  return secureDatabaseURL(url, process.env.NODE_ENV === 'production');
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
