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
    '!__tests__',
    '!**/*.d.ts'
  ],
  testTimeout: 30000,
  globalSetup: './__tests__/helpers/hooks/setup.ts',
  globalTeardown: './__tests__/helpers/hooks/teardown.ts',
  globals: {
    chance: chance = require('chance')(Math.random()),
  }
};