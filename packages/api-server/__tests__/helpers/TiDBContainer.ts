import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { AbstractStartedContainer } from 'testcontainers/dist/modules/abstract-started-container';
import { RandomUuid } from 'testcontainers/dist/uuid';
import { Connection, createConnection } from 'mysql2/promise';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';

const uuid = new RandomUuid();

export default class TiDBContainer extends GenericContainer {

  private database: string = uuid.nextUuid();
  private rootPassword: string = '';
  private username: string = uuid.nextUuid();
  private userPassword: string = uuid.nextUuid();

  constructor (image: string = 'pingcap/tidb:v6.3.0') {
    super(image);
  }

  async start (): Promise<StartedTiDBContainer> {
    this
      .withExposedPorts(4000)
      .withEnvironment({
        MYSQL_DATABASE: this.database,
        MYSQL_ROOT_PASSWORD: this.rootPassword,
        MYSQL_USER: 'root',
        MYSQL_PASSWORD: this.rootPassword,
      })
      .withStartupTimeout(120000);
    const container = new StartedTiDBContainer(await super.start(), this.database, this.username, this.userPassword, this.rootPassword);
    await container.runInitialSchema();
    return container;
  }
}

export class StartedTiDBContainer extends AbstractStartedContainer {
  readonly port: number;

  constructor (startedTestContainer: StartedTestContainer, public readonly database: string, public readonly username: string, public readonly userPassword: string, public readonly rootPassword: string) {
    super(startedTestContainer);
    this.port = startedTestContainer.getMappedPort(4000);
  }

  url (database: boolean = true): string {
    return `mysql://root:${this.rootPassword}@${this.getHost()}:${this.port}${database ? `/${this.database}` : ''}`;
  }

  async exec ([query]: string[]) {
    const conn = await this.createConnection();
    const [res] = await conn.query({ sql: query });
    conn.destroy()
    return { output: JSON.stringify(res), exitCode: 0 };
  }

  async expect (query: string): Promise<jest.JestMatchers<any>> {
    const conn = await this.createConnection();
    const [result] = await conn.query({ sql: query })
    conn.destroy()
    return expect(result)
  }

  async createConnection (database: boolean = true) {
    const conn = await createConnection(this.url(database))
    await conn.execute("SET @@tidb_multi_statement_mode='ON'");
    await conn.execute("set @@sql_mode='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION'")
    return conn;
  }

  async runInitialSchema () {
    const names = await fs.readdir('__tests__/schema');
    let conn = await this.createConnection(false);

    // SET GLOBAL tidb_multi_statement_mode='ON'
    // set @@sql_mode='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION'

    async function execute(conn: Connection, sql: string) {
      await conn.query(sql);
    }

    for (let name of names) {
      if (/\.sql$/.test(name)) {
        const sqlPath = path.join('__tests__/schema', name);
        let sql = await fs.readFile(sqlPath, { encoding: 'utf-8' });
        if (name.startsWith('0.') /* create schema */) {
          sql = sql.replaceAll('gharchive_dev', this.database);
          await execute(conn, sql);
          conn.destroy();
          // Database created
          conn = await this.createConnection();
        } else {
          await execute(conn, sql);
        }
      }
    }
    conn.destroy()
  }
}
