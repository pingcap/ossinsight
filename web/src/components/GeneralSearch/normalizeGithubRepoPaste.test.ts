import { describe, expect, it } from 'vitest';
import { normalizeGithubRepoPaste } from './normalizeGithubRepoPaste';

describe('normalizeGithubRepoPaste', () => {
  it('strips https github origin', () => {
    expect(
      normalizeGithubRepoPaste('https://github.com/pingcap/ossinsight'),
    ).toBe('pingcap/ossinsight');
  });

  it('handles http origin with trailing slash', () => {
    expect(
      normalizeGithubRepoPaste('http://github.com/pingcap/ossinsight/'),
    ).toBe('pingcap/ossinsight');
  });

  it('handles urls with additional path segments', () => {
    expect(
      normalizeGithubRepoPaste('https://github.com/pingcap/ossinsight/issues/123'),
    ).toBe('pingcap/ossinsight');
  });

  it('handles urls with query or hash', () => {
    expect(
      normalizeGithubRepoPaste('https://github.com/pingcap/ossinsight?tab=stars#section'),
    ).toBe('pingcap/ossinsight');
  });

  it('handles bare github.com prefix without scheme', () => {
    expect(
      normalizeGithubRepoPaste('github.com/pingcap/ossinsight'),
    ).toBe('pingcap/ossinsight');
  });

  it('returns owner when repo segment absent', () => {
    expect(
      normalizeGithubRepoPaste('https://github.com/pingcap/'),
    ).toBe('pingcap');
  });

  it('ignores non github inputs', () => {
    expect(normalizeGithubRepoPaste('gitlab.com/pingcap/ossinsight')).toBe('gitlab.com/pingcap/ossinsight');
  });

  it('leaves clean owner/repo text untouched', () => {
    expect(normalizeGithubRepoPaste('pingcap/ossinsight')).toBe('pingcap/ossinsight');
  });

  it('trims whitespace and removes www subdomain', () => {
    expect(
      normalizeGithubRepoPaste('  https://www.github.com/pingcap/ossinsight/  '),
    ).toBe('pingcap/ossinsight');
  });

  it('removes .git suffix from repo names', () => {
    expect(
      normalizeGithubRepoPaste('https://github.com/pingcap/ossinsight.git'),
    ).toBe('pingcap/ossinsight');
  });
});
