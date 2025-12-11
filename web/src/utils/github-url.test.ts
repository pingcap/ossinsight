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

  it('should handle URLs with additional paths', () => {
    expect(cleanGitHubUrl('https://github.com/pingcap/ossinsight/issues')).toBe('pingcap/ossinsight/issues');
  });
});
