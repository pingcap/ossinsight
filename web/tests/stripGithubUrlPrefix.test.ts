import assert from 'node:assert/strict';
import test from 'node:test';

import { stripGithubUrlPrefix } from '../src/utils/gh';

void test('removes https GitHub prefix', () => {
  assert.equal(stripGithubUrlPrefix('https://github.com/pingcap/ossinsight'), 'pingcap/ossinsight');
});

void test('removes http GitHub prefix and trailing slash', () => {
  assert.equal(stripGithubUrlPrefix('http://github.com/pingcap/ossinsight/'), 'pingcap/ossinsight');
});

void test('removes host-only GitHub prefix without protocol', () => {
  assert.equal(stripGithubUrlPrefix('github.com/pingcap/ossinsight/'), 'pingcap/ossinsight');
});

void test('handles prefixed URL with nested path by leaving remainder intact', () => {
  assert.equal(stripGithubUrlPrefix('https://github.com/pingcap/ossinsight/issues/1'), 'pingcap/ossinsight/issues/1');
});

void test('ignores non GitHub URLs', () => {
  assert.equal(stripGithubUrlPrefix('https://example.com/foo'), 'https://example.com/foo');
});

void test('passes already clean input through', () => {
  assert.equal(stripGithubUrlPrefix('pingcap/ossinsight'), 'pingcap/ossinsight');
});
