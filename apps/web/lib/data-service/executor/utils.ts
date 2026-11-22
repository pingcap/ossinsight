import { EndpointConfig } from '../config';
import { prepareQueryParameters, querySQLLiteral } from '@ossinsight/types';

export type EndpointResult = Record<any, any>;
export const BIG_NUMBER_TYPES = ['BIGINT', 'DECIMAL'];

export function prepareQueryContext(queryConfig: EndpointConfig, values: Record<string, any>) {
  try {
    return prepareQueryParameters(queryConfig.params, values);
  } catch {
    throw new APIError('Invalid query parameters.');
  }
}

export function applyLegacyQueryParameters(queryConfig: EndpointConfig, sqlTemplate: string, context: Record<string, any>) {
  for (const param of queryConfig.params) {
    if (param.replaces == null) continue;
    const value = context[param.name];
    const replacement = Array.isArray(value) ? value.map(querySQLLiteral).join(', ') : String(value);
    sqlTemplate = sqlTemplate.replaceAll(String(param.replaces), () => replacement);
  }
  return sqlTemplate;
}

export class APIError extends Error {
  get publicMessage() { return this.statusCode >= 500 ? 'Internal Server Error' : this.message; }
  constructor(message: string, public statusCode: number = 400) {
    super(message);
  }
}
