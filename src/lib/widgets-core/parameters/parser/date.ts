import { DateParameterDefinition } from '@ossinsight/widgets-types';
import { DateTime } from 'luxon';

const DATE_EXPR = /^T([+-]\d+)(day|month|year)$/;

export default function parseDate (value: any, definition: DateParameterDefinition) {
  if (!definition.expression) {
    if (value == null) {
      return value;
    }
    return anyDate(value, [DateTime.fromSQL, DateTime.fromJSDate, DateTime.fromISO, DateTime.fromMillis, DateTime.fromHTTP, DateTime.fromRFC2822]).startOf('day').toSQLDate();
  } else {
    if (definition.expression === 'T') {
      return DateTime.now().startOf(definition.type).toSQLDate();
    }
    const exprResult = DATE_EXPR.exec(definition.expression);
    if (!exprResult) {
      throw new Error(`invalid date expression ${definition.expression} (example "T-1day")`);
    }
    const [_, num, unit] = exprResult;
    const offset = Number(num);
    if (!isFinite(offset)) {
      throw new Error('invalid date offset expression (example "T-1day")');
    }
    return DateTime.now().startOf(definition.type).plus({ [unit]: offset }).toSQLDate();
  }
}

function anyDate (value: any, fns: ((value: any) => DateTime)[]) {
  for (let fn of fns) {
    try {
      const result = fn(value);
      if (result.isValid) {
        return result;
      }
    } catch {
    }
  }

  throw new Error(`Cannot parse value ${value} as date.`);
}
