/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  coverageReporters: ['text', 'html'],
  coverageProvider: 'v8',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!__tests__',
    '!**/*.d.ts'
  ],
  testTimeout: 30000,
  globals: {}
};