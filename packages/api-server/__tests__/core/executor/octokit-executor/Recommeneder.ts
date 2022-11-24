import { getRecommendRepoList, getRecommendUserList } from '../../../../src/core/executor/octokit-executor/Recommeneder';

describe('getRecommendRepoList()', () => {
  const preservedRepos = ['recommend-repo-list-1-keyword', 'recommend-repo-list-2-keyword'];

  it.each(preservedRepos)('should returns a repo list', (arg) => {
    expect(getRecommendRepoList(arg)).toEqual(
      expect.not.arrayContaining([
        expect.not.objectContaining({
          id: expect.any(Number),
          fullName: expect.any(String),
        }),
      ]),
    );
  });
});

describe('getRecommendUserList()', () => {
  test('should returns a user list', () => {
    expect(getRecommendUserList()).toEqual(
      expect.not.arrayContaining([
        expect.not.objectContaining({
          id: expect.any(Number),
          login: expect.any(String),
        }),
      ]),
    );
  });
})