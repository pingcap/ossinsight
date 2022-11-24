import {bootstrapTestDatabase, releaseTestDatabase} from '../helpers/db';
import { CollectionService } from '../../src/services/collection-service';
import { testLogger } from '../helpers/log';
import CacheBuilder from '../../src/core/cache/CacheBuilder';
import {createConnection} from "mysql2/promise";
import {getConnectionOptions} from "../../src/utils/db";
import {TiDBQueryExecutor} from "../../src/core/executor/query-executor/TiDBQueryExecutor";

beforeAll(bootstrapTestDatabase);
afterAll(releaseTestDatabase);

test('should execute valid sql', async () => {
  const conn = await createConnection(getConnectionOptions());
  const executor = new TiDBQueryExecutor(getConnectionOptions(), false)
  const cacheBuilder = new CacheBuilder(testLogger, false, conn);
  const collectionService = new CollectionService(testLogger, executor, cacheBuilder);

  expect((await collectionService.getCollections()).data).toBeInstanceOf(Array);
  expect((await collectionService.getCollectionRepos(1)).data).toBeInstanceOf(Array);
  expect(await collectionService.getOSDBRepoGroups()).toBeInstanceOf(Array);
});
