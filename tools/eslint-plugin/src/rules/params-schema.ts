import { JsonParserResult } from '@stoplight/json';
import { Linter } from 'eslint';
import { ajv, transformJsonSchemaErrorObject } from '../utils';

const paramsSchema = ajv.compile(require('../../../../schemas/widget/v1/parameters-schema.json'));

export function validateParamsSchema (result: JsonParserResult<any>): Linter.LintMessage[] {
  const res = paramsSchema(result.data);

  if (!res) {
    return transformJsonSchemaErrorObject('ossinsight/params-schema', result, paramsSchema.errors);
  }

  return [];
}