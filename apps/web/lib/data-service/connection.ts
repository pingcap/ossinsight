import { connect } from '@tidbcloud/serverless';

export function getOssInsightDatabase() {
  return process.env.OSSINSIGHT_DATABASE || 'gharchive_dev';
}

export function createTiDBConnection() {
  return connect({
    url: process.env.DATABASE_URL,
    database: getOssInsightDatabase(),
  });
}
