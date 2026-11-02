import { QuerySchema, prepareQueryParameters } from '@ossinsight/types';
import { Liquid } from 'liquidjs';
import { BadParamsError } from './QueryParser';

export class QueryLiquidParser {
  private readonly engine = new Liquid();

  async parse(templateSQL: string, queryConfig: QuerySchema, values: Record<string, any>) {
    let context: Record<string, any>;
    try {
      context = prepareQueryParameters(queryConfig.params, values);
    } catch {
      throw new BadParamsError('query', 'Invalid query parameters.');
    }
    return this.engine.parseAndRender(templateSQL, context);
  }
}
