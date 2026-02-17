import { Liquid } from 'liquidjs';
import type { QueryParam } from '@ossinsight/types';

const liquid = new Liquid();

/**
 * Render a SQL template with the given parameters.
 * Supports both legacy (string replacement) and liquid template engines.
 */
export function renderTemplate(
  templateSql: string,
  params: QueryParam[],
  values: Record<string, string | string[]>,
  engine: 'legacy' | 'liquid' = 'legacy',
): string {
  if (engine === 'liquid') {
    return liquid.parseAndRenderSync(templateSql, values);
  }

  // Legacy engine: simple string replacement
  let sql = templateSql;
  for (const param of params) {
    const value = values[param.name] ?? param.default ?? param.replaces;

    if (param.template && typeof value === 'string' && param.template[value]) {
      sql = sql.replace(param.replaces, param.template[value]);
    } else if (Array.isArray(value)) {
      sql = sql.replace(param.replaces, value.join(', '));
    } else {
      sql = sql.replace(param.replaces, String(value));
    }
  }

  return sql;
}

/**
 * Validate parameter values against their schemas.
 */
export function validateParams(
  params: QueryParam[],
  values: Record<string, unknown>,
): string[] {
  const errors: string[] = [];

  for (const param of params) {
    const value = values[param.name];

    // Check required (no default = required)
    if (value === undefined && param.default === undefined) {
      // Not strictly required if replaces exists as default
      continue;
    }

    if (value === undefined) continue;

    // Check pattern
    if (param.pattern && typeof value === 'string') {
      const re = new RegExp(param.pattern);
      if (!re.test(value)) {
        errors.push(`Parameter '${param.name}' does not match pattern: ${param.pattern}`);
      }
    }

    // Check enums
    if (param.enums) {
      const allowed = Array.isArray(param.enums) ? param.enums : [param.enums];
      if (!allowed.includes(String(value))) {
        errors.push(`Parameter '${param.name}' must be one of: ${allowed.join(', ')}`);
      }
    }

    // Check array type
    if (param.type === 'array' && Array.isArray(value)) {
      if (param.maxArrayLength && value.length > param.maxArrayLength) {
        errors.push(
          `Parameter '${param.name}' exceeds max array length of ${param.maxArrayLength}`,
        );
      }
    }
  }

  return errors;
}
