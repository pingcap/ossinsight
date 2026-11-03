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

test('rejects standalone and header Basic credentials without exposing either representation', async () => {
  const root = await mkdtemp(join(tmpdir(), 'docs-secret-test-'));
  const decoded = 'test-user:synthetic-private-key-for-unit-test';
  const encoded = Buffer.from(decoded).toString('base64');
  try {
    await writeFile(join(root, 'example.mdx'), `API key\n\`\`\`\n${encoded}\n\`\`\`\nAuthorization: Basic ${encoded.replace(/=+$/, '')}\n`);
    const findings = await findContentSecrets(root);
    assert.deepEqual(findings, [{file: 'example.mdx', line: 3}, {file: 'example.mdx', line: 5}]);
    assert.equal(JSON.stringify(findings).includes(encoded), false);
    assert.equal(JSON.stringify(findings).includes(decoded), false);
  } finally { await rm(root, {recursive: true, force: true}); }
});

test('allows credential placeholders and unrelated Base64 content', async () => {
  const root = await mkdtemp(join(tmpdir(), 'docs-secret-test-'));
  try {
    const values = [
      '<PUBLIC_KEY>:<PRIVATE_KEY>',
      Buffer.from('<PUBLIC_KEY>:<PRIVATE_KEY>').toString('base64'),
      Buffer.from('{"description":"not an authentication credential"}').toString('base64'),
      Buffer.from('ordinary encoded documentation text').toString('base64'),
    ];
    await writeFile(join(root, 'example.mdx'), values.join('\n'));
    assert.deepEqual(await findContentSecrets(root), []);
  } finally { await rm(root, {recursive: true, force: true}); }
});
