import {join, relative} from "path";
import {Chance} from "chance";
import {createConnection} from 'mysql2/promise';
import fs from "node:fs/promises";

let db: TiDBDatabase | undefined;

const chance = Chance();

function getRelativePath (path: string | undefined) {
  if (!path) {
    return undefined
  }

  const name = relative(join(process.cwd(), '__tests__'), path)
      .replace(/\.ts$/, '')
      .replace(/\B([A-Z])/g, '_$1')
      .toLowerCase();
  return name.length === 0 ? undefined : name;
}

function underline(original?: string) {
  return original?.trim().replace(/[\s/\-.]/g, '_').slice(-64);
}

function genDatabaseName () {
  const { currentTestName, testPath } = expect.getState();
  return underline(currentTestName) ?? underline(getRelativePath(testPath)) ?? underline(chance.city()) as string;
}

export async function bootstrapTestDatabase () {
  if (db) {
    return db;
  }
  const _db = new TiDBDatabase(genDatabaseName());
  await _db.ready;
  process.env.DATABASE_URL = _db.url();
  db = _db;
  return db;
}

export async function releaseTestDatabase () {
  if (db) {
    await db.stop();
    process.env.DATABASE_URL = '';
    db = undefined;
  }
}

export function getTestDatabase () {
  if (!db) {
    throw new Error('TiDB test container not initialized. Call and await "__tests__/helpers/db".bootstrapTestDatabase().');
  }
  return db;
}

export class TiDBDatabase {
  public readonly host: string;
  public readonly port: number;

  private readonly initPromise: Promise<void>;

  constructor (public readonly database: string) {
    const { __TIDB_HOST, __TIDB_PORT } = process.env;
    if (!__TIDB_PORT || !__TIDB_HOST) {
      throw new Error('tidb container not started');
    }
    this.host = __TIDB_HOST;
    this.port = parseInt(__TIDB_PORT);
    this.initPromise = this.runInitialSchema();
  }

  get ready (): Promise<void> {
    return this.initPromise;
  }

  url (): string {
    return `mysql://executoruser:executorpassword@${this.host}:${this.port}/${this.database}`;
  }

  rootUrl (): string {
    return `mysql://root:@${this.host}:${this.port}`;
  }

  async expect (query: string): Promise<jest.JestMatchers<any>> {
    const conn = await this.createConnection();
    const [result] = await conn.query({ sql: query });
    await conn.destroy();
    return expect(result);
  }

  async createConnection () {
    return createConnection(this.url());
  }

  private async createRootConnection () {
    const conn = await createConnection(this.rootUrl());
    await conn.execute(`SET @@tidb_multi_statement_mode='ON'`);
    await conn.execute(`SET @@sql_mode='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION'`);
    return conn;
  }

  protected async runInitialSchema () {
    const conn = await this.createRootConnection();
    const filenames = await fs.readdir('__tests__/migrations');
    const sqls = filenames
        .filter((filename) => /\.sql$/.test(filename))
        .sort()
        .map((filename) => join('__tests__/migrations', filename))
        .map(async (filename) => await fs.readFile(filename, 'utf8'));

    for await (const sql of sqls) {
      await conn.query(sql.replaceAll('gharchive_dev', this.database));
    }

    await conn.destroy();
  }

  async stop () {
    const conn = await this.createRootConnection();
    await conn.query(`DROP DATABASE ${this.database};`);
    await conn.destroy();
    return this;
  }

}