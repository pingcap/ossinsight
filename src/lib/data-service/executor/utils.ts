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

  return processedValue;
}

export class APIError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
  }
}