import {Expression, type IsolationLevel, Kysely, MysqlDialect, sql} from 'kysely';
import { createPool } from 'mysql2';
import type { DB } from './schema';
import { AsyncLocalStorage } from 'async_hooks';
import {envConfig} from "@env";

export const kysely = new Kysely<DB>({
  dialect: new MysqlDialect({
    pool: createPool({
      uri: envConfig.DATABASE_URL!,
      ssl: envConfig.DATABASE_URL?.includes('tidbcloud.com') ? {
        minVersion: 'TLSv1.2',
      } : undefined,
    }),
  }),
});

const currentTx = new AsyncLocalStorage<Kysely<DB>>();

async function tx<T> (level: IsolationLevel, runner: () => Promise<T>): Promise<T>
async function tx<T> (runner: () => Promise<T>): Promise<T>
async function tx<T> (first: IsolationLevel | (() => Promise<T>), runner?: () => Promise<T>): Promise<T> {
  let builder = kysely.transaction();
  if (typeof first === 'function') {
    runner = first;
  } else {
    builder.setIsolationLevel(first);
  }

  // Join current transaction
  const current = currentTx.getStore();
  if (current) {
    return runner!();
  }

  return kysely.transaction().execute(async trx => {
    return currentTx.run(trx, runner!);
  });
}

export function values<T>(expr: Expression<T>) {
  return sql<T>`VALUES(${expr})`
}

function getDb<D extends Partial<DB> = DB> (): Kysely<D> {
  const tx = currentTx.getStore();
  if (tx) {
    return tx as never;
  }
  return kysely as never;
}

export { getDb, tx };

export type { DB } from './schema';
