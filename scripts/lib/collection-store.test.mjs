import test from 'node:test';
import assert from 'node:assert/strict';
import {collectionStore, validateCollection} from './collection-store.mjs';

test('all import writes separate SQL from quote, backslash and Unicode data', async () => {
  const calls = [];
  const store = collectionStore({execute: async (sql, args) => { calls.push({sql, args}); return []; }});
  const hostile = "quote\\' OR 1=1 -- ? :id 中文";
  await store.create(1, hostile);
  await store.remove(1, hostile);
  await store.lookup(hostile);
  await store.add(1, hostile, '123');
  for (const {sql, args} of calls) {
    assert.equal(sql.includes(hostile), false);
    const encoded = args.find(value => typeof value === 'string');
    assert.match(encoded, /^[0-9a-f]+$/);
    assert.equal(Buffer.from(encoded, 'hex').toString('utf8'), hostile);
    assert.ok(sql.includes('CONVERT(UNHEX(?) USING utf8mb4)'));
  }
});

test('malformed numeric IDs cannot reach any database operation', () => {
  const store = collectionStore({execute: () => assert.fail('must not query')});
  for (const value of ['1 OR 1=1', '1e3', -1, 1.5, {}, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => store.get(value));
    assert.throws(() => store.add(1, 'owner/repo', value));
  }
});

test('collection metadata is bounded and matches the selected file', () => {
  assert.doesNotThrow(() => validateCollection({id: 1, name: "O'Reilly tools", items: ['pingcap/.github']}, '1'));
  for (const items of [['a/..'], ['a/b/c'], ['a/repo\nforged-log'], ['a/' + 'x'.repeat(101)], [{}]]) {
    assert.throws(() => validateCollection({id: 1, name: 'test', items}, '1'));
  }
  assert.throws(() => validateCollection({id: 2, name: 'test', items: []}, '1'));
});
