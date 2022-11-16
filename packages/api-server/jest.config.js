/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/helpers/',
  ],
  coverageReporters: ['text', 'html'],
  coverageProvider: 'v8',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!__tests__'
  ],
  testTimeout: 30000,
};