import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { AbstractStartedContainer } from 'testcontainers/dist/modules/abstract-started-container';

const DEFAULT_IMAGE_NAME = 'redis:6.2.6';

export default class RedisContainer extends GenericContainer {

  constructor (image: string = DEFAULT_IMAGE_NAME) {
    super(image);
  }

  async start (): Promise<StartedRedisContainer> {
    this
      .withExposedPorts(6379)
      .withStartupTimeout(120000);
    return new StartedRedisContainer(await super.start());
  }

}

export class StartedRedisContainer extends AbstractStartedContainer {
  readonly port: number;

  constructor (startedTestContainer: StartedTestContainer) {
    super(startedTestContainer);
    this.port = startedTestContainer.getMappedPort(6379);
  }

}

