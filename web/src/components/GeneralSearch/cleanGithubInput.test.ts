import { describe, expect, it } from 'vitest';
import { cleanGithubInput } from './cleanGithubInput';

describe('cleanGithubInput', () => {
  it('removes https GitHub prefixes', () => {
    expect(cleanGithubInput('https://github.com/pingcap/ossinsight')).toBe('pingcap/ossinsight');
  });

  it('removes http GitHub prefixes and trailing slash', () => {
    expect(cleanGithubInput('http://github.com/pingcap/ossinsight/')).toBe('pingcap/ossinsight');
  });

  it('keeps additional path segments', () => {
    expect(cleanGithubInput('https://github.com/pingcap/ossinsight/issues/1879')).toBe('pingcap/ossinsight/issues/1879');
  });

  it('keeps trailing segments but removes terminal slash', () => {
    expect(cleanGithubInput('https://github.com/pingcap/ossinsight/issues/1879/')).toBe('pingcap/ossinsight/issues/1879');
  });

  it('removes redundant slash before query or hash', () => {
    expect(cleanGithubInput('https://github.com/pingcap/ossinsight/?tab=repositories')).toBe('pingcap/ossinsight?tab=repositories');
    expect(cleanGithubInput('https://github.com/pingcap/ossinsight/#readme')).toBe('pingcap/ossinsight#readme');
  });

  it('returns empty when only the GitHub origin is pasted', () => {
    expect(cleanGithubInput('https://github.com/')).toBe('');
    expect(cleanGithubInput('https://github.com')).toBe('');
  });

  it('passes through already clean repo names', () => {
    expect(cleanGithubInput('pingcap/ossinsight')).toBe('pingcap/ossinsight');
  });

  it('ignores non GitHub URLs', () => {
    expect(cleanGithubInput('https://example.com/pingcap/ossinsight')).toBe('https://example.com/pingcap/ossinsight');
  });

  it('preserves query strings after the path', () => {
    expect(cleanGithubInput('https://github.com/pingcap/ossinsight?tab=repositories')).toBe('pingcap/ossinsight?tab=repositories');
  });

  it('removes www prefix and is case-insensitive', () => {
    expect(cleanGithubInput('HTTPS://WWW.GITHUB.COM/pingcap/ossinsight/')).toBe('pingcap/ossinsight');
  });
});
