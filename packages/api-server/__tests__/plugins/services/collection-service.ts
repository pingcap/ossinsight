import {bootstrapTestDatabase, getTestDatabase, releaseTestDatabase} from '../../helpers/db';
import { CollectionService } from '../../../src/plugins/services/collection-service';
import { testLogger } from '../../helpers/log';
import CacheBuilder from '../../../src/core/cache/CacheBuilder';
import {getConnection, getConnectionOptions} from "../../../src/core/db/new";
import {TiDBQueryExecutor} from "../../../src/core/executor/query-executor/TiDBQueryExecutor";

beforeAll(bootstrapTestDatabase);
afterAll(releaseTestDatabase);

test('collection service should work', async () => {
  const conn = await getConnection({
    uri: getTestDatabase().url()
  });
  const cacheBuilder = new CacheBuilder(testLogger, false, conn);
  const executor = new TiDBQueryExecutor(getConnectionOptions({
    uri: getTestDatabase().url()
  }), false)
  const collectionService = new CollectionService(testLogger, executor, cacheBuilder);

  expect((await collectionService.getCollections()).data).toBeInstanceOf(Array);
  expect((await collectionService.getCollectionRepos(1)).data).toBeInstanceOf(Array);
  expect(await collectionService.getOSDBRepoGroups()).toBeInstanceOf(Array);
});
