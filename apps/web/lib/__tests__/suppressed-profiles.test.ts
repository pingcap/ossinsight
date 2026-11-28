import { createSuppression, parseSuppressedAccounts } from '@/lib/suppressed-profiles';

const suppression = createSuppression(parseSuppressedAccounts('Example-User:4242, other:7'));
const kind = (url: string) => {
  const parsed = new URL(url, 'https://ossinsight.io');
  return suppression.suppressedRequestKind(parsed.pathname, parsed.searchParams);
};

describe('suppressed accounts', () => {
  it('parses login:id pairs and ignores malformed entries', () => {
    expect(parseSuppressedAccounts('Example-User:4242, other:7')).toEqual([
      { login: 'example-user', id: 4242 },
      { login: 'other', id: 7 },
    ]);
    expect(parseSuppressedAccounts(undefined)).toEqual([]);
    expect(parseSuppressedAccounts('no-id, :5, bad/login:1, name:abc')).toEqual([]);
  });

  it('blocks the profile, organization, repository and compare pages of the account', () => {
    expect(kind('/analyze-user/example-user')).toBe('page');
    expect(kind('/analyze-user/EXAMPLE-USER')).toBe('page');
    expect(kind('/analyze/example-user')).toBe('page');
    expect(kind('/analyze/example-user/some-repo')).toBe('page');
    expect(kind('/analyze/example-user/some-repo/opengraph-image')).toBe('page');
    expect(kind('/compare/pingcap/tidb/example-user/some-repo')).toBe('page');
    expect(kind('/analyze-user/example%2Duser')).toBe('page');
  });

  it('blocks data routes that name the account by login or by id', () => {
    expect(kind('/gh/users/example-user')).toBe('data');
    expect(kind('/gh/user/4242')).toBe('data');
    expect(kind('/gh/repo/example-user/some-repo')).toBe('data');
    expect(kind('/api/avatar/example-user')).toBe('data');
    expect(kind('/q/personal-overview?userId=4242')).toBe('data');
    expect(kind('/api/q/personal-languages?user_id=4242')).toBe('data');
    expect(kind('/api/q/orgs/overview?ownerId=4242')).toBe('data');
  });

  it('compares the numeric identity used by the data route', () => {
    for (const value of ['004242', '4242.0', '4.242e3', '0x1092']) {
      expect(suppression.isSuppressedAccountId(value)).toBe(true);
    }
    for (const value of ['4243', '4242.1', 'not-a-number', '']) {
      expect(suppression.isSuppressedAccountId(value)).toBe(false);
    }
  });

  it('leaves every other request alone', () => {
    expect(kind('/analyze-user/someone-else')).toBeNull();
    expect(kind('/analyze/example-user-2/repo')).toBeNull();
    expect(kind('/analyze/pingcap/example-user')).toBeNull();
    expect(kind('/gh/user/42420')).toBeNull();
    expect(kind('/q/personal-overview?userId=42420')).toBeNull();
    expect(kind('/q/events-total?repoId=4242')).toBeNull();
    expect(kind('/collections/example-user')).toBeNull();
    expect(kind('/')).toBeNull();
  });

  it('filters accounts and their repositories out of result lists', () => {
    expect(suppression.isSuppressedLogin('Example-User')).toBe(true);
    expect(suppression.isSuppressedAccountId('4242')).toBe(true);
    expect(suppression.isSuppressedAccountId(4242)).toBe(true);
    expect(suppression.isSuppressedRepoName('example-user/some-repo')).toBe(true);
    expect(suppression.isSuppressedRepoName('pingcap/example-user')).toBe(false);
  });

  it('does nothing when no account is configured', () => {
    const none = createSuppression([]);
    expect(none.suppressedRequestKind('/analyze-user/example-user', new URLSearchParams())).toBeNull();
    expect(none.isSuppressedLogin('example-user')).toBe(false);
  });
});
