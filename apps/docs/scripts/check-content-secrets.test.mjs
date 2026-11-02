import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {findContentSecrets} from './check-content-secrets.mjs';

test('rejects embedded JWTs without printing their contents', async () => {
  const root = await mkdtemp(join(tmpdir(), 'docs-secret-test-'));
  const syntheticToken = ['eyJhbGciOiJIUzI1NiJ9', Buffer.from('{"test":true}').toString('base64url'), 'testonlysignature'.repeat(3)].join('.');
  try {
    await writeFile(join(root, 'example.mdx'), `Example\nhttps://example.invalid/?token=${syntheticToken}`);
    const findings = await findContentSecrets(root);
    assert.deepEqual(findings, [{file: 'example.mdx', line: 2}]);
    assert.equal(JSON.stringify(findings).includes(syntheticToken), false);
    await writeFile(join(root, 'example.mdx'), 'Use your own exported schema. YOUR_TOKEN');
    assert.deepEqual(await findContentSecrets(root), []);
  } finally { await rm(root, {recursive: true, force: true}); }
});
