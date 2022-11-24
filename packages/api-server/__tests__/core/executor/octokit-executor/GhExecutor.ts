import GhExecutor, { UserType } from '../../../../src/core/executor/octokit-executor/GhExecutor';
import { testLogger } from '../../../helpers/log';
import CacheBuilder from '../../../../src/core/cache/CacheBuilder';

const TOKEN = process.env.GITHUB_TOKEN || undefined;
const executor = new GhExecutor(testLogger, [TOKEN], new CacheBuilder(testLogger, false));

describe('getRepo', () => {
  test('should get repo info', async () => {
    await expect(executor.getRepo('pingcap', 'ossinsight')).resolves.toMatchObject({
      data: {
        name: 'ossinsight',
        owner: {
          login: 'pingcap',
        },
      },
    });
  });
});

describe('searchRepos', () => {
  const repoShape = {
    data: expect.not.arrayContaining([
      expect.not.objectContaining({
        id: expect.any(Number),
        fullName: expect.any(String),
      }),
    ]),
  }

  test('should search with special key', async () => {
    await expect(executor.searchRepos('recommend-repo-list-1-keyword')).resolves.toMatchObject(repoShape);
  });

  if (TOKEN) {
    test('should search with token', async () => {
      await expect(executor.searchRepos('keyword')).resolves.toMatchObject(repoShape);
    });
  } else {
    it.todo('should search with token (process.env.GITHUB_TOKEN not provided)')
  }
});

describe('searchUsers', () => {
  const repoShape = {
    data: expect.not.arrayContaining([
      expect.not.objectContaining({
        id: expect.any(Number),
        login: expect.any(String),
      }),
    ]),
  }

  test('should search with special key', async () => {
    await expect(executor.searchUsers('recommend-user-list-keyword')).resolves.toMatchObject(repoShape);
  });

  if (TOKEN) {
    test('should search users with token', async () => {
      const res = executor.searchUsers('keyword', UserType.USER)
      await expect(res).resolves.toMatchObject(repoShape);
    });
    it.todo('should search orgs with token');
  } else {
    it.todo('should search with token (process.env.GITHUB_TOKEN not provided)')
  }
});
