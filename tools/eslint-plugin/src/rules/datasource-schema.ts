import { JsonParserResult } from '@stoplight/json';
import { Linter } from 'eslint';
import { ajv, transformJsonSchemaErrorObject } from '../utils';

const datasourceSchema = ajv.compile(require('../../../../schemas/widget/v1/datasource-schema.json'));

export function validateDatasourceSchema (result: JsonParserResult<any>): Linter.LintMessage[] {
  const res = datasourceSchema(result.data);

  if (!res) {
    return transformJsonSchemaErrorObject('ossinsight/datasource-schema', result, datasourceSchema.errors);
  }

  return [];
}