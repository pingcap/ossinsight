import {QuerySchema} from "@ossinsight/types/src";

export enum ParamTypes {
  ARRAY = 'array',
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  INTEGER = 'integer',
}

export enum ParamItemTypes {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  INTEGER = 'integer',
}

export type ParamType = `${ParamTypes}`;

export type ParamItemType = `${ParamItemTypes}`;

export class BadParamsError extends Error {
  readonly msg: string
  constructor(public readonly name: string, message: string) {
    super(message);
    this.msg = message
  }
}

export interface QueryParser {
  parse(templateSQL: string, queryConfig: QuerySchema, values: Record<string, any>): Promise<string>;
}
