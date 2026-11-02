// Offline security tests: no production services and no Docker bootstrap.
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/security/**/*.test.ts'],
  transform: { '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }] },
  maxWorkers: 12,
};
