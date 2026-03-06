import { getLocationForJsonPath, JsonParserResult } from '@stoplight/json';
import Ajv, { ErrorObject } from 'ajv';
import { Linter } from 'eslint';

export const ajv = new Ajv();

export function transformJsonSchemaErrorObject (ruleId: string, result: JsonParserResult<any>, errors: ErrorObject[]): Linter.LintMessage[] {
  return errors.map(error => {
    const location = getLocationForJsonPath(result, error.instancePath.split('/').slice(1));

    return {
      ruleId,
      message: ajv.errorsText([error]),
      ...transformJsonRange(location),
      severity: 2,
    };
  });
}

export function transformJsonRange (location: ReturnType<typeof getLocationForJsonPath>): Pick<Linter.LintMessage, 'line' | 'column' | 'endLine' | 'endColumn'> {
  if (!location) {
    return {
      line: 1,
      column: 1,
    };
  }
  const { range: { start, end } } = location;

  return {
    line: 1 + start.line,
    column: 1 + start.character,
    endLine: 1 + end.line,
    endColumn: 1 + end.character,
  };
}