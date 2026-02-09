import { cleanGitHubUrl } from './github-url';

describe('cleanGitHubUrl', () => {
  it('should strip https://github.com/ prefix', () => {
    expect(cleanGitHubUrl('https://github.com/pingcap/ossinsight')).toBe('pingcap/ossinsight');
  });

  it('should strip http://github.com/ prefix', () => {
    expect(cleanGitHubUrl('http://github.com/user/repo')).toBe('user/repo');
  });

  it('should strip trailing slash', () => {
    expect(cleanGitHubUrl('https://github.com/pingcap/ossinsight/')).toBe('pingcap/ossinsight');
  });

  it('should handle http with trailing slash', () => {
    expect(cleanGitHubUrl('http://github.com/user/repo/')).toBe('user/repo');
  });

  it('should leave plain repo names unchanged', () => {
    expect(cleanGitHubUrl('pingcap/ossinsight')).toBe('pingcap/ossinsight');
  });

  it('should leave already clean names unchanged', () => {
    expect(cleanGitHubUrl('user/repo')).toBe('user/repo');
  });

  it('should handle empty string', () => {
    expect(cleanGitHubUrl('')).toBe('');
  });

  it('should trim additional path segments such as issues or pulls', () => {
    expect(cleanGitHubUrl('https://github.com/pingcap/ossinsight/issues')).toBe('pingcap/ossinsight');
    expect(cleanGitHubUrl('https://github.com/pingcap/ossinsight/issues/123')).toBe('pingcap/ossinsight');
    expect(cleanGitHubUrl('https://github.com/pingcap/ossinsight/pull/456')).toBe('pingcap/ossinsight');
  });

  it('should strip optional .git suffixes', () => {
    expect(cleanGitHubUrl('https://github.com/pingcap/ossinsight.git')).toBe('pingcap/ossinsight');
    expect(cleanGitHubUrl('https://github.com/pingcap/ossinsight.git/issues/123')).toBe('pingcap/ossinsight');
    expect(cleanGitHubUrl('pingcap/ossinsight.git')).toBe('pingcap/ossinsight');
  });

  it('should strip scheme-less github.com prefixes', () => {
    expect(cleanGitHubUrl('github.com/pingcap/ossinsight')).toBe('pingcap/ossinsight');
    expect(cleanGitHubUrl('www.github.com/pingcap/ossinsight')).toBe('pingcap/ossinsight');
    expect(cleanGitHubUrl('github.com/pingcap/ossinsight/issues/1')).toBe('pingcap/ossinsight');
  });

  it('should strip query strings and fragments', () => {
    expect(cleanGitHubUrl('https://github.com/pingcap/ossinsight?tab=repositories')).toBe('pingcap/ossinsight');
    expect(cleanGitHubUrl('https://github.com/pingcap/ossinsight#readme')).toBe('pingcap/ossinsight');
    expect(cleanGitHubUrl('https://github.com/pingcap/ossinsight/issues/1?tab=files#diff-123')).toBe('pingcap/ossinsight');
  });

  it('should leave non-www GitHub subdomain URLs unchanged', () => {
    expect(cleanGitHubUrl('https://api.github.com/repos/pingcap/ossinsight')).toBe('https://api.github.com/repos/pingcap/ossinsight');
    expect(cleanGitHubUrl('https://raw.github.com/user/repo/main/file.txt')).toBe('https://raw.github.com/user/repo/main/file.txt');
  });
});
