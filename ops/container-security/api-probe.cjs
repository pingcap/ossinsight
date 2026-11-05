const assert = require('node:assert/strict');
const fs = require('node:fs');
const {setTimeout: delay} = require('node:timers/promises');
const sqlite = require('/app/packages/api-server/node_modules/sqlite3');
(async () => {
  assert.notEqual(process.getuid(), 0);
  for (const path of ['/app/configs', '/app/packages/api-server/dist/app.js']) {
    assert.equal(fs.statSync(path).uid, 0);
    assert.equal(fs.statSync(path).mode & 0o022, 0);
    assert.throws(() => fs.accessSync(path, fs.constants.W_OK));
  }
  for (const name of ['gcc', 'g++', 'make', 'python3']) assert.equal(fs.existsSync('/usr/bin/' + name), false);
  for (const name of ['npm', 'npx', 'yarn', 'corepack', 'pnpm']) assert.equal(fs.existsSync('/usr/local/bin/' + name), false);
  assert.equal(fs.existsSync('/app/.env'), false);
  assert.equal(typeof require('/app/packages/api-server/node_modules/@ossinsight/types').secureDatabaseURL, 'function');
  const version = await new Promise((resolve, reject) => {
    const db = new sqlite.Database('/tmp/container-probe.db');
    db.get('SELECT sqlite_version() AS version', (error, row) => {
      if (error) return reject(error);
      db.close(error => error ? reject(error) : resolve(row.version));
    });
  });
  assert.equal(version, '3.52.0');
  fs.unlinkSync('/tmp/container-probe.db');
  const base = 'http://127.0.0.1:' + process.env.API_SERVER_PORT;
  let ready = false;
  for (let i = 0; i < 30; i++) {
    try {ready = (await fetch(base + '/healthy', {signal: AbortSignal.timeout(1000)})).status === 200;} catch {}
    if (ready) break;
    await delay(500);
  }
  assert(ready, 'API failed to become ready');
  for (const path of ['/metrics', '/docs/json']) {
    assert.equal((await fetch(base + path, {signal: AbortSignal.timeout(5000)})).status, 401);
    assert.equal((await fetch(base + path, {signal: AbortSignal.timeout(5000), headers: {authorization: 'Bearer ' + process.env.OPERATIONS_TOKEN}})).status, 200);
  }
  assert.equal((await fetch(base + '/explorer/answer', {method: 'POST', signal: AbortSignal.timeout(5000)})).status, 401);
  const missing = await fetch(base + '/container-security-not-found', {signal: AbortSignal.timeout(5000)});
  assert.equal(missing.status, 404);
  assert.equal(missing.headers.get('x-ratelimit-limit'), '600');
  assert(missing.headers.get('x-request-id'));
  console.log(JSON.stringify({api: true, uid: process.getuid(), node: process.version, sqlite: version,
    codeAndConfigsReadOnly: true, compilerAbsent: true, httpChecks: 7}));
})().catch(error => {console.error(error); process.exitCode = 1;});
