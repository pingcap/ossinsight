import { EndpointConfig, Params } from '../config';


export type EndpointResult = Record<any, any>;

export const BIG_NUMBER_TYPES = ['BIGINT', 'DECIMAL'];

/**
 * Define the parameter type.
 */
export const enum ParameterType {
  ARRAY = "array",
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
  INTEGER = "integer"
}

/**
 * Define the array item type.
 */
export const enum ParameterItemType {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
  INTEGER = "integer"
}


export function prepareQueryContext(queryConfig: EndpointConfig, values: Record<string, any>) {
  let context: Record<string, any> = {};
  for (const param of queryConfig.params) {
    const value = values[param.name] ?? param.default;

    if (param.type === ParameterType.ARRAY) {
      const values = Array.isArray(value) ? value : [value];
      context[param.name] = values.map((itemValue: any) => {
        return verifyParamValue(param, itemValue);
      });
    } else {
      context[param.name] = verifyParamValue(param, value);
    }

  }
  return context;
}

export function applyLegacyQueryParameters(
  queryConfig: EndpointConfig,
  sqlTemplate: string,
  context: Record<string, any>,
) {
  let nextSQL = sqlTemplate;

  for (const param of queryConfig.params) {
    if (param.replaces == null) {
      continue;
    }

    const value = context[param.name];
    let replaceValue: string;

    if (param.type === ParameterType.ARRAY) {
      const arrayValues = Array.isArray(value) ? value : [value];
      const maxArrayLength = param.maxArrayLength ?? 10;
      if (arrayValues.length > maxArrayLength) {
        throw new APIError(`The length of the array <${param.name}> is too long (max length: ${maxArrayLength}).`);
      }

      replaceValue = arrayValues
        .map((itemValue) => stringifyParamValue(param.itemType ?? ParameterItemType.STRING, itemValue))
        .join(', ');
    } else {
      if (value == null) {
        throw new APIError(`Require parameter <${param.name}> not found.`);
      }
      replaceValue = String(value);
    }

    nextSQL = nextSQL.replaceAll(String(param.replaces), replaceValue);
  }

  return nextSQL;
}

function verifyParamValue(param: Params, value: any) {
  const type = (param.type === ParameterType.ARRAY ? param.itemType : param.type) || ParameterType.STRING;
  let processedValue = value;
  switch (type) {
    case ParameterItemType.BOOLEAN:
      if (value === 'true') {
        processedValue = true;
      } else if (value === 'false') {
        processedValue = false;
      } else if (typeof value === 'boolean') {
        processedValue = value;
      } else {
        throw new APIError(`The parameter <${param.name}> is not a boolean.`);
      }
      break;
    case ParameterItemType.NUMBER:
      const num = Number(value);
      if (value === null || Number.isNaN(num)) {
        throw new APIError(`The parameter <${param.name}> is not a number.`);
      }
      processedValue = num;
      break;
    case ParameterItemType.INTEGER:
      const int = Number(value);
      if (value === null || Number.isNaN(int) || !Number.isInteger(int)) {
        throw new APIError(`The parameter <${param.name}> is not an integer.`);
      }
      processedValue = int;
      break;
    case ParameterItemType.STRING:
      if (param.pattern) {
        const regex = new RegExp(param.pattern);
        if (!regex.test(value)) {
          throw new APIError(`The parameter <${param.name}> does not match the pattern "${param.pattern}".`);
        }
      }
      break;
    default:
      throw new APIError(`The parameter <${param.name}> has an unknown type.`);
  }

  if (Array.isArray(param.enums) && !param.enums.includes(processedValue)) {
    throw new APIError(`The parameter <${param.name}> is not in the enums.`);
  }

  if (param.template) {
    const templateValue = param.template[String(processedValue)];
    if (templateValue == null) {
      throw new APIError(`Parameter value <${processedValue}> doesn't have matching template.`);
    }
    processedValue = templateValue;
  }

  return processedValue;
}

function stringifyParamValue(type: ParameterItemType | ParameterType, value: any) {
  switch (type) {
    case ParameterItemType.STRING:
      // Escape backslashes and single quotes to prevent SQL injection
      const escaped = String(value).replaceAll('\\', '\\\\').replaceAll("'", "''");
      return `'${escaped}'`;
    case ParameterItemType.INTEGER:
    case ParameterItemType.NUMBER:
      return `${typeof value === 'string' ? Number(value) : value}`;
    case ParameterItemType.BOOLEAN:
      return value ? '1' : '0';
    default:
      throw new APIError(`unknown param type ${type}`);
  }
}

export class APIError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
  }
}
