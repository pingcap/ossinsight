/**
 * Unit tests for cleanGitHubUrl function
 * Tests the GitHub URL prefix stripping functionality for issue #1879
 */

// Extract the function for testing
const cleanGitHubUrl = (text) => {
  return text.replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
};

// Manual test execution
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
