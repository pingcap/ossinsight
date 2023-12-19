import {Params, QuerySchema} from "@ossinsight/types/src";
import { sync as glob } from 'glob';
import * as path from 'node:path';
import * as fs from 'node:fs';
import RandExp from 'randexp';
import {ParamTypes} from "../../src/core/runner/query/QueryParser";

export const QUERIES_PATH = path.resolve(__dirname, '../../../../configs/queries');

export function findAllQueriesPath () {
  const paths = glob(path.join(QUERIES_PATH, '**/template.sql'));
  return paths.map(path.dirname);
}

export function eachQuery (cb: (name: string, sql: string, schema: QuerySchema) => void) {
  findAllQueriesPath().forEach(queryPath => {
    const sql = fs.readFileSync(path.join(queryPath, 'template.sql'), { encoding: 'utf-8' });
    const queryConfigPath = fs.existsSync(path.join(queryPath, 'params.json')) ? path.join(queryPath, 'params.json') : path.join(queryPath, 'query.json');
    const queryConfig = JSON.parse(fs.readFileSync(queryConfigPath, { encoding: 'utf-8' }));
    cb(path.relative(QUERIES_PATH, queryPath), sql, queryConfig);
  });
}

export function buildParams (schema: QuerySchema): Record<string, string>[] {
  const enumKeys: string[] = [];
  const enumValues: string[][] = [];

  try {
    schema.params.forEach(param => {
      if (param.type === ParamTypes.ARRAY) {
        const values = getValues(param);
        enumKeys.push(param.name);
        enumValues.push(values);
      } else {
        const values = getValues(param);
        if (param.name === 'collectionId') {
          console.log(values)
        }
        enumKeys.push(param.name);
        enumValues.push(values);
      }


    });
  } catch (e) {
    if ((e as any)?.message === 'special param not supported') {
      return [];
    }
  }

  if (enumKeys.length === 0) {
    return [];
  }

  const cursor = enumKeys.map(() => 0);
  const result: Record<string, string>[] = [];

  const build = () => {
    result.push(cursor.reduce((res: Record<string, string>, item, index) => {
      res[enumKeys[index]] = enumValues[index][item];
      return res;
    }, {}));
  };

  let i = enumKeys.length - 1;
  while (true) {
    while (cursor[i] < enumValues[i].length) {
      build();
      cursor[i] += 1;
    }
    while (i >= 0 && cursor[i] >= enumValues[i].length - 1) {
      cursor[i] = 0;
      i -= 1;
    }
    if (i >= 0) {
      cursor[i]++;
      i = enumKeys.length - 1;
    } else {
      break;
    }
  }

  return result;
}

export function getValues(param: Params) {
  const type = param.type === ParamTypes.ARRAY ? param.itemType : param.type;
  let values: string[] = [];
  if (param.enums) {
    if (typeof param.enums === 'string') {
      if (param.enums === 'collectionIds') {
        values = ['10001']
      } else {
        throw new Error('Unknown enum type');
      }
    } else {
      values = param.enums;
    }
  } else if (type === ParamTypes.INTEGER || type === ParamTypes.NUMBER) {
    const val = 1000 + Math.floor(Math.random() * 2000);
    values = [val.toString()];
  } else if (type === ParamTypes.BOOLEAN) {
    values = ['true', 'false'];
  } else if (param.pattern) {
    const rand = new RandExp(param.pattern);
    rand.max = 9;
    values = [rand.gen()];
  } else {
    throw new Error('special param not supported');
  }
  return values;
}