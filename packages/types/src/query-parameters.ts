/** Validation shared by the web and API named-query engines. */
export interface QueryParameter {
  name: string;
  type?: string;
  itemType?: string;
  pattern?: string;
  enums?: string | unknown[];
  template?: Record<string, string>;
  default?: unknown;
  maxArrayLength?: number;
}

export function prepareQueryParameters(params: QueryParameter[], input: Record<string, unknown>) {
  const context: Record<string, any> = Object.create(null);
  for (const param of params) {
    const supplied = Object.prototype.hasOwnProperty.call(input, param.name) ? input[param.name] : undefined;
    const value = supplied ?? param.default;
    const fail = () => { throw new Error(`Invalid query parameter: ${param.name}`); };
    const validate = (raw: unknown): string | number | boolean => {
      if (raw == null || !['string', 'number', 'boolean'].includes(typeof raw)) return fail();
      if (String(raw).length > 1000) return fail();
      const type = (param.type === 'array' ? param.itemType : param.type) || 'string';
      let result: string | number | boolean;
      if (type === 'integer' || type === 'number') {
        if (typeof raw === 'boolean' || String(raw).trim() === '') return fail();
        result = Number(raw);
        if (!Number.isFinite(result) || (type === 'integer' && !Number.isSafeInteger(result))) return fail();
      } else if (type === 'boolean') {
        if (raw !== true && raw !== false && raw !== 'true' && raw !== 'false') return fail();
        result = raw === true || raw === 'true';
      } else if (type === 'string') {
        result = String(raw);
        // Legacy scalar values become SQL text. Missing validation must fail
        // closed instead of silently admitting arbitrary SQL or Liquid input.
        if (!param.pattern && !Array.isArray(param.enums) && !param.template) return fail();
      } else {
        return fail();
      }
      if (param.pattern) {
        const match = new RegExp(param.pattern).exec(String(result));
        if (!match || match.index !== 0 || match[0].length !== String(result).length) return fail();
      }
      if (Array.isArray(param.enums) && !param.enums.includes(result)) return fail();
      if (param.template) {
        if (!Object.prototype.hasOwnProperty.call(param.template, String(result))) return fail();
        return param.template[String(result)];
      }
      return result;
    };
    if (param.type === 'array') {
      const values = Array.isArray(value) ? value : [value];
      if (values.length === 0 || values.length > Math.min(param.maxArrayLength ?? 10, 100)) fail();
      context[param.name] = values.map(validate);
    } else {
      context[param.name] = validate(value);
    }
  }
  return context;
}

/** Encode text independently of the connection's NO_BACKSLASH_ESCAPES mode. */
export function querySQLLiteral(value: string | number | boolean): string {
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Invalid SQL number');
    return String(value);
  }
  const hex = Array.from(new TextEncoder().encode(value), byte => byte.toString(16).padStart(2, '0')).join('');
  return `CONVERT(X'${hex}' USING utf8mb4)`;
}
