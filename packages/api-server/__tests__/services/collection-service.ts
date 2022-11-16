import { bootstrapTestContainer, getExecutor, releaseTestContainer } from '../helpers/db';
import { CollectionService } from '../../src/services/collection-service';
import { testLogger } from '../helpers/log';
import CacheBuilder from '../../src/core/cache/CacheBuilder';

beforeAll(bootstrapTestContainer);
afterAll(releaseTestContainer);

it('should execute valid sql', async () => {
  const collectionService = new CollectionService(testLogger, getExecutor(), new CacheBuilder(testLogger, false));

  expect((await collectionService.getCollections()).data).toBeInstanceOf(Array);
  expect((await collectionService.getCollectionRepos(1)).data).toBeInstanceOf(Array);
  expect(await collectionService.getOSDBRepoGroups()).toBeInstanceOf(Array);
});
