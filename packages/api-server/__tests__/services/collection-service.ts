import {bootstrapTestContainer, getExecutor, releaseTestContainer} from '../helpers/db';
import { CollectionService } from '../../src/services/collection-service';
import { testLogger } from '../helpers/log';
import CacheBuilder from '../../src/core/cache/CacheBuilder';
import {createConnection} from "mysql2/promise";
import {getConnectionOptions} from "../../src/utils/db";

beforeAll(bootstrapTestContainer);
afterAll(releaseTestContainer);

test('should execute valid sql', async () => {
  const conn = await createConnection(getConnectionOptions());
  const collectionService = new CollectionService(testLogger, getExecutor(), new CacheBuilder(testLogger, false, conn));

  expect((await collectionService.getCollections()).data).toBeInstanceOf(Array);
  expect((await collectionService.getCollectionRepos(1)).data).toBeInstanceOf(Array);
  expect(await collectionService.getOSDBRepoGroups()).toBeInstanceOf(Array);
});
