/**
 * Unit tests for cleanGitHubUrl function
 * Tests the GitHub URL prefix stripping functionality for issue #1879
 */

import { cleanGitHubUrl } from './cleanGitHubUrl';

// Test cases
describe('cleanGitHubUrl', () => {
  test('should strip https://github.com/ prefix', () => {
    const input = 'https://github.com/pingcap/ossinsight';
    const expected = 'pingcap/ossinsight';
    expect(cleanGitHubUrl(input)).toBe(expected);
  });

  test('should strip http://github.com/ prefix', () => {
    const input = 'http://github.com/user/repo';
    const expected = 'user/repo';
    expect(cleanGitHubUrl(input)).toBe(expected);
  });

  test('should strip trailing slash', () => {
    const input = 'https://github.com/user/repo/';
    const expected = 'user/repo';
    expect(cleanGitHubUrl(input)).toBe(expected);
  });

  test('should handle URL without trailing slash', () => {
    const input = 'https://github.com/pingcap/ossinsight';
    const expected = 'pingcap/ossinsight';
    expect(cleanGitHubUrl(input)).toBe(expected);
  });

  test('should leave non-GitHub URLs unchanged', () => {
    const input = 'pingcap/ossinsight';
    const expected = 'pingcap/ossinsight';
    expect(cleanGitHubUrl(input)).toBe(expected);
  });

  test('should handle empty string', () => {
    const input = '';
    const expected = '';
    expect(cleanGitHubUrl(input)).toBe(expected);
  });

  test('should handle partial GitHub URL', () => {
    const input = 'github.com/user/repo';
    const expected = 'github.com/user/repo';
    expect(cleanGitHubUrl(input)).toBe(expected);
  });
});

// Manual test execution (since jest is not configured for this package)
console.log('Running manual tests for cleanGitHubUrl...\n');

const tests = [
  { input: 'https://github.com/pingcap/ossinsight', expected: 'pingcap/ossinsight' },
  { input: 'http://github.com/user/repo', expected: 'user/repo' },
  { input: 'https://github.com/user/repo/', expected: 'user/repo' },
  { input: 'pingcap/ossinsight', expected: 'pingcap/ossinsight' },
  { input: '', expected: '' },
  { input: 'github.com/user/repo', expected: 'github.com/user/repo' },
];

let passed = 0;
let failed = 0;

tests.forEach(({ input, expected }, index) => {
  const result = cleanGitHubUrl(input);
  const success = result === expected;

  if (success) {
    console.log(`✓ Test ${index + 1} passed: "${input}" → "${result}"`);
    passed++;
  } else {
    console.log(`✗ Test ${index + 1} failed: "${input}" → "${result}" (expected: "${expected}")`);
    failed++;
  }
});

console.log(`\nTest Summary: ${passed} passed, ${failed} failed, ${tests.length} total`);

if (failed === 0) {
  console.log('✓ All tests passed!');
  process.exit(0);
} else {
  console.log('✗ Some tests failed');
  process.exit(1);
}
