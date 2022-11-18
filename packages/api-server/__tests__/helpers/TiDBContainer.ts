import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { AbstractStartedContainer } from 'testcontainers/dist/modules/abstract-started-container';
import { Connection, createConnection } from 'mysql2/promise';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';

export default class TiDBContainer extends GenericContainer {

  private rootPassword: string = '';

  constructor (image: string = 'pingcap/tidb:v6.3.0') {
    super(image);
  }

  async start (): Promise<StartedTiDBContainer> {
    this
      .withExposedPorts(4000)
      .withEnvironment({
        MYSQL_DATABASE: '',
        MYSQL_ROOT_PASSWORD: this.rootPassword,
        MYSQL_USER: 'root',
        MYSQL_PASSWORD: this.rootPassword,
      })
      .withStartupTimeout(120000);
    return new StartedTiDBContainer(await super.start());
  }
}

export class StartedTiDBContainer extends AbstractStartedContainer {
  readonly port: number;

  constructor (startedTestContainer: StartedTestContainer) {
    super(startedTestContainer);
    this.port = startedTestContainer.getMappedPort(4000);
  }

  url (): string {
    return `mysql://root:@${this.getHost()}:${this.port}`;
  }

  async exec ([query]: string[]) {
    const conn = await this.createConnection();
    const [res] = await conn.query({ sql: query });
    conn.destroy();
    return { output: JSON.stringify(res), exitCode: 0 };
  }

  async createConnection () {
    const conn = await createConnection(this.url());
    await conn.execute('SET @@tidb_multi_statement_mode=\'ON\'');
    await conn.execute('set @@sql_mode=\'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION\'');
    return conn;
  }

  protected async runInitialSchema () {
    // empty
  }
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
    conn.destroy();
    return expect(result);
  }

  async createConnection () {
    const conn = await createConnection(this.url());
    await conn.execute('set @@sql_mode=\'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION\'');
    return conn;
  }

  private async createRootConnection () {
    const conn = await createConnection(this.rootUrl());
    await conn.execute('SET @@tidb_multi_statement_mode=\'ON\'');
    await conn.execute('set @@sql_mode=\'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION\'');
    return conn;
  }

  protected async runInitialSchema () {
    const names = await fs.readdir('__tests__/schema');
    let conn = await this.createRootConnection();

    // SET GLOBAL tidb_multi_statement_mode='ON'
    // set @@sql_mode='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION'

    async function execute (conn: Connection, sql: string) {
      await conn.query(sql);
    }

    for (let name of names) {
      if (/\.sql$/.test(name)) {
        const sqlPath = path.join('__tests__/schema', name);
        let sql = await fs.readFile(sqlPath, { encoding: 'utf-8' });
        if (name.startsWith('0.') || name.startsWith('z.')) {
          sql = sql.replaceAll('gharchive_dev', this.database);
          await execute(conn, sql);
          // Database created
          await execute(conn, `use ${this.database};`);
        } else {
          await execute(conn, sql);
        }
      }
    }
    conn.destroy();
  }

  async stop () {
    const conn = await this.createRootConnection();
    conn.query(`DROP DATABASE ${this.database};`);
    conn.destroy();
    return this;
  }
}
