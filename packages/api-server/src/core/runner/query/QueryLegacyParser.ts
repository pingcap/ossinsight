import { QuerySchema, prepareQueryParameters, querySQLLiteral } from '@ossinsight/types';
import { BadParamsError } from './QueryParser';

export class QueryLegacyParser {
  async parse(templateSQL: string, queryConfig: QuerySchema, values: Record<string, any>) {
    let context: Record<string, any>;
    try {
      context = prepareQueryParameters(queryConfig.params, values);
    } catch {
      throw new BadParamsError('query', 'Invalid query parameters.');
    }
    for (const param of queryConfig.params) {
      if (param.replaces == null) continue;
      const value = context[param.name];
      const replacement = Array.isArray(value) ? value.map(querySQLLiteral).join(', ') : String(value);
      templateSQL = templateSQL.replaceAll(String(param.replaces), () => replacement);
    }
    return templateSQL;
  }
}
