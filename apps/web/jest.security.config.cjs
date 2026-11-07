module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/lib/explorer/__tests__/**/*.test.ts'],
  transform: {'^.+\\.tsx?$': ['ts-jest', {tsconfig: {module: 'CommonJS', moduleResolution: 'node', jsx: 'react-jsx', esModuleInterop: true}, diagnostics: true}]},
  moduleNameMapper: {'^@/(.*)$': '<rootDir>/$1'},
};
