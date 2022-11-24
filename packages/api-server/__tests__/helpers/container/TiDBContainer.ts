import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { AbstractStartedContainer } from 'testcontainers/dist/modules/abstract-started-container';
import { createConnection } from 'mysql2/promise';

const DEFAULT_IMAGE_NAME = 'pingcap/tidb:v6.4.0';

export default class TiDBContainer extends GenericContainer {

  private rootPassword: string = '';

  constructor (image: string = DEFAULT_IMAGE_NAME) {
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
    await conn.execute(`SET @@tidb_multi_statement_mode='ON'`);
    await conn.execute(`set @@sql_mode='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION'`);
    return conn;
  }

}

