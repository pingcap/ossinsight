import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createServer} from 'node:net';
import {AddressInfo} from 'node:net';
import {resolve} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import {bootstrapTestDatabase, releaseTestDatabase} from '../helpers/db';
import {bootstrapTestRedis, releaseTestRedis} from '../helpers/redis';

test.each(['current-only', 'overlap', 'expired'] as const)('the production CLI boots with protected operations %s', async mode => {
  const db = await bootstrapTestDatabase();
  const redis = await bootstrapTestRedis();
  const reservation = createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const port = (reservation.address() as AddressInfo).port;
  await new Promise<void>((done, reject) => reservation.close(error => error ? reject(error) : done()));
  const token = 'synthetic-local-operations-token-32-characters';
  const previous = 'synthetic-previous-operations-token-32-characters';
  const rotation = mode === 'current-only' ? {} : {OPERATIONS_TOKEN_PREVIOUS: previous,
    OPERATIONS_TOKEN_PREVIOUS_EXPIRES_AT: new Date(Date.now() + (mode === 'overlap' ? 60000 : -1000)).toISOString()};
  const child = spawn(process.execPath, [require.resolve('fastify-cli/cli.js'), 'start', '--options',
    '-a', '127.0.0.1', '-p', String(port), '-L', 'dist/logger.js', '-l', 'info', 'dist/app.js'], {
    cwd: resolve(__dirname, '../..'),
    env: {PATH: process.env.PATH, NODE_ENV: 'test', CONFIGS_PATH: resolve(__dirname, '../../../../configs'),
      DATABASE_URL: db.url(), PLAYGROUND_DATABASE_URL: db.analyticsUrl(), REDIS_URL: redis.url(),
      GITHUB_ACCESS_TOKENS: '', OPENAI_API_KEY: 'synthetic-test-key', AUTH0_SECRET: 'synthetic-local-hmac-secret',
      OPERATIONS_TOKEN: token, ...rotation},
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const exited = once(child, 'exit');
  let output = '';
  for (const stream of [child.stdout, child.stderr]) stream!.on('data', chunk => {output = (output + chunk).slice(-8000);});
  const base = `http://127.0.0.1:${port}`;
  let ready = false;
  try {
    for (let i = 0; i < 100; i++) {
      if (child.exitCode !== null || child.signalCode !== null) throw new Error(`API exited before readiness: ${output}`);
      try {ready = (await fetch(base + '/healthy', {signal: AbortSignal.timeout(1000)})).status === 200;} catch {}
      if (ready) break;
      await delay(100);
    }
    if (!ready) throw new Error(`API readiness deadline exceeded: ${output}`);
    for (const path of ['/metrics', '/docs/json']) {
      expect((await fetch(base + path)).status).toBe(401);
      expect((await fetch(base + path, {headers: {authorization: `Bearer ${token}`}})).status).toBe(200);
      const old = await fetch(base + path, {headers: {authorization: `Bearer ${previous}`}});
      expect(old.status).toBe(mode === 'overlap' ? 200 : 401);
      expect(old.headers.get('cache-control')).toBe('no-store');
    }
    expect((await fetch(base + '/explorer/answer', {method: 'POST'})).status).toBe(401);
    const missing = await fetch(base + '/security-test-not-found');
    expect(missing.status).toBe(404);
    expect(missing.headers.get('x-ratelimit-limit')).toBe('600');
    expect(missing.headers.get('x-request-id')).toBeTruthy();
  } finally {
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGTERM');
    const forced = setTimeout(() => child.kill('SIGKILL'), 5000);
    const [exitCode] = await exited;
    clearTimeout(forced);
    await releaseTestRedis();
    await releaseTestDatabase();
    if (ready) expect(exitCode).toBe(0);
  }
});
