/* eslint-disable quote-props */
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'plugin:react/recommended',
    'standard-with-typescript'
  ],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: [
      'tsconfig.json',
      'plugins/tsconfig.json'
    ],
  },
  plugins: [
    'react'
  ],
  rules: {
    'react/display-name': ['warn'],
    '@typescript-eslint/comma-dangle': ['error', 'only-multiline'],
    'semi': 'off',
    '@typescript-eslint/semi': ['error', 'always'],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/member-delimiter-style': 'off',
    '@typescript-eslint/array-type': ['error', {default: 'array-simple'}],
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
