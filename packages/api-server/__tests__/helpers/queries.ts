import { sync as glob } from 'glob';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { QuerySchema } from '../../src/types/query.schema';
import RandExp from 'randexp';

export const QUERIES_PATH = path.resolve(__dirname, '../../../../configs/queries');

export function findAllQueriesPath () {
  const paths = glob(path.join(QUERIES_PATH, '**/template.sql'));
  return paths.map(path.dirname);
}

export function eachQuery (cb: (name: string, sql: string, schema: QuerySchema) => void) {
  findAllQueriesPath().forEach(queryPath => {
    const sql = fs.readFileSync(path.join(queryPath, 'template.sql'), { encoding: 'utf-8' });
    const paramsPath = fs.existsSync(path.join(queryPath, 'params.json')) ? path.join(queryPath, 'params.json') : path.join(queryPath, 'query.json');
    const params = JSON.parse(fs.readFileSync(paramsPath, { encoding: 'utf-8' }));
    cb(path.relative(QUERIES_PATH, queryPath), sql, params);
  });
}

export function buildParams (schema: QuerySchema): Record<string, string>[] {
  const enumKeys: string[] = [];
  const enumValues: string[][] = [];

  try {
    schema.params.forEach(param => {
      if (param.type === 'employees') {
        throw new Error('special param not supported');
      }
      if (param.enums) {
        if (typeof param.enums === 'string') {
          // TODO: implement this
          throw new Error('special param not supported');
        } else {
          enumKeys.push(param.name);
          enumValues.push(param.enums);
        }
      } else if (param.pattern) {
        const rand = new RandExp(param.pattern);
        rand.max = 9;
        enumKeys.push(param.name);
        enumValues.push([rand.gen()]);
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
