import { FullResult } from '@tidbcloud/serverless';
import { Liquid } from 'liquidjs';
import { DateTime } from 'luxon';
import { EndpointConfig } from '../config';
import { createTiDBConnection } from '../connection';
import { applyLegacyQueryParameters, BIG_NUMBER_TYPES, prepareQueryContext } from './utils';

const tidb = createTiDBConnection();

const templateEngine = new Liquid();

export default async function executeEndpoint (name: string, config: EndpointConfig, sqlTemplate: string, params: Record<string, any>, geo?: any, signal?: AbortSignal) {
  const queryParams = prepareQueryContext(config, params);
  const replacedSQL = applyLegacyQueryParameters(config, sqlTemplate, queryParams);
  const sql = await templateEngine.parseAndRender(replacedSQL, queryParams);

  // TODO: Migrate legacy template-based SQL construction to parameterized queries.
  // Currently the SQL is built via string replacement (applyLegacyQueryParameters)
  // with values validated by prepareQueryContext (pattern/enum checks).
  // The stringifyParamValue function escapes quotes for STRING types as a defense layer.
  const start = DateTime.now();
  const result = await tidb.execute(sql, null, {
    fullResult: true,
  }) as FullResult;
  signal?.throwIfAborted();
  const end = DateTime.now();
  const duration = end.diff(start).as('seconds');

  return {
    params: queryParams,
    sql: result.statement,
    types: result.types,
    data: result.rows!.map((row: Record<string, any>) => {
      return Object.fromEntries(Object.entries(row).map(([key, value]) => {
        if (BIG_NUMBER_TYPES.includes(result.types![key])) {
          return [key, Number(value)];
        }
        return [key, value];
      }));
    }),
    requestedAt: start.toISO(),
    finishedAt: end.toISO(),
    spent: duration,
    geo: geo,
  };
}
