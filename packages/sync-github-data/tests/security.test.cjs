const {test} = require('node:test');
require('reflect-metadata');
const assert = require('node:assert/strict');
const {createHmac, randomBytes} = require('node:crypto');
const pino = require('pino');
const {secureDatabaseUrl} = require('../dist/libs/db/prisma');
const {getConnectionOptions, getPoolOptions} = require('../dist/libs/db/new');
const {hashGitHubEmail, wrapLegacyEmailPseudonym, assertEmailHashSecret} = require('../dist/utils/email-hash');
const {encodeEmailBackup, decodeEmailBackup, planEmailChanges} = require('../dist/utils/email-rekey');
const {safeError} = require('../dist/utils/safe-error');
const {OctokitFactory, isDeadCredential, eraseToken} = require('../dist/libs/github/octokit');
const {GitHubHelper} = require('../dist/libs/github/helper');

test('Prisma replaces insecure and duplicate TLS flags and bounds resource settings', () => {
  const url = new URL(secureDatabaseUrl('tidb://test:fixture@db.example.invalid/database?sslaccept=accept_invalid_certs&sslaccept=accept_invalid_certs&connect_timeout=0&socket_timeout=999&connection_limit=999', 'production'));
  assert.equal(url.protocol, 'mysql:');
  assert.deepEqual(url.searchParams.getAll('sslaccept'), ['strict']);
  assert.equal(url.searchParams.get('connect_timeout'), '10');
  assert.equal(url.searchParams.get('socket_timeout'), '30');
  assert.equal(url.searchParams.get('connection_limit'), '4');
});

test('invalid DSNs never expose credentials through errors or allow remote test databases', () => {
  for (const value of [undefined, 'private-dsn-password', 'https://user:private-dsn-password@db.example.invalid/db', 'mysql://a:b@localhost/db?socket=/tmp/mysql.sock']) {
    assert.throws(() => secureDatabaseUrl(value, 'production'), error => !error.message.includes('private-dsn-password'));
  }
  assert.throws(() => secureDatabaseUrl('mysql://localhost:fixture@db.example.invalid/db', 'test'), /loopback/);
  for (const host of ['127.0.0.1', 'localhost', '[::1]']) {
    const url = new URL(secureDatabaseUrl(`mysql://test:fixture@${host}:4000/db`, 'test'));
    assert.equal(url.searchParams.has('sslaccept'), false);
  }
});

test('mysql2 ignores DSN transport overrides and cannot disable certificate or hostname validation', () => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    const options = getPoolOptions({uri: 'mysql://test:fixture@db.example.invalid/db?ssl=false&multipleStatements=true', ssl: {rejectUnauthorized: false, verifyIdentity: false}, multipleStatements: true, connectionLimit: 999});
    assert.equal(options.uri, undefined);
    assert.equal(options.host, 'db.example.invalid');
    assert.equal(options.multipleStatements, false);
    assert.equal(options.ssl.rejectUnauthorized, true);
    assert.equal(options.ssl.verifyIdentity, true);
    assert.equal(options.connectionLimit, 4);
    assert.throws(options.infileStreamFactory, /disabled/);
    process.env.NODE_ENV = 'test';
    assert.throws(() => getConnectionOptions({uri: 'mysql://localhost:fixture@db.example.invalid/db'}), /local database/);
  } finally {if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous;}
});

test('all auxiliary CLI entry points apply transport policy before opening a database', async t => {
  const {Command} = require('commander');
  const mysql = require('mysql2/promise');
  const prisma = require('@prisma/client');
  const github = require('../dist/libs/github/octokit');
  const previous = {pool: mysql.createPool, prisma: prisma.PrismaClient, github: github.createOctokitPool,
    environment: process.env.NODE_ENV, database: process.env.DATABASE_URL, ca: process.env.DB_SSL_CA};
  const stopped = new Error('Test stops before any network or database operation');
  const config = {DATABASE_URL: 'mysql://fixture:fixture@db.example.invalid/fixture?ssl=false&sslaccept=accept_invalid_certs&connection_limit=999', GITHUB_ACCESS_TOKENS: []};
  const logger = pino({enabled: false});
  let captured;
  try {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'mysql://ambient:unused@wrong.example.invalid/wrong';
    delete process.env.DB_SSL_CA;
    mysql.createPool = options => {captured = options; throw stopped;};
    prisma.PrismaClient = function (options) {captured = options; throw stopped;};
    github.createOctokitPool = () => ({max: 1});
    for (const [module, init, name, driver] of [
      ['users/load-orgs', 'initLoadOrgsCommand', 'load-orgs', 'mysql'],
      ['users/format-orgs', 'initFormatOrgsCommand', 'format-orgs', 'mysql'],
      ['users/mark-bots', 'initMarkBotsCommand', 'mark-bots', 'mysql'],
      ['users/format-address', 'initFormatAddressCommand', 'format-address', 'prisma'],
      ['repos/pull', 'InitPullReposCommand', 'pull', 'prisma'],
      ['repos/mark-deleted', 'initMarkDeletedReposCommand', 'mark-deleted', 'prisma'],
      ['repos/sync-in-concurrent', 'initSyncReposInConcurrentCommand', 'sync-in-concurrent', 'prisma'],
    ]) {
      await t.test(module, async () => {
        captured = undefined;
        const command = new Command();
        require('../dist/commands/' + module)[init](command, config, logger);
        await assert.rejects(command.parseAsync([name], {from: 'user'}), error => error === stopped);
        assert.ok(captured, 'The command must pass explicit secured connection options');
        if (driver === 'mysql') {
          assert.equal(captured.host, 'db.example.invalid');
          assert.equal(captured.uri, undefined);
          assert.equal(captured.ssl.rejectUnauthorized, true);
          assert.equal(captured.ssl.verifyIdentity, true);
          assert.equal(captured.multipleStatements, false);
          assert.equal(captured.connectionLimit, 4);
          assert.equal(captured.connectTimeout, 10000);
          assert.throws(captured.infileStreamFactory, /disabled/);
        } else {
          const url = new URL(captured.datasources.db.url);
          assert.equal(url.hostname, 'db.example.invalid');
          assert.deepEqual(url.searchParams.getAll('sslaccept'), ['strict']);
          assert.equal(url.searchParams.get('connection_limit'), '4');
          assert.equal(url.searchParams.get('connect_timeout'), '10');
          assert.equal(url.searchParams.get('socket_timeout'), '30');
        }
      });
    }
  } finally {
    mysql.createPool = previous.pool;
    prisma.PrismaClient = previous.prisma;
    github.createOctokitPool = previous.github;
    for (const [key, value] of Object.entries({NODE_ENV: previous.environment, DATABASE_URL: previous.database, DB_SSL_CA: previous.ca})) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});

test('migrated pseudonyms exactly match fresh imports without retaining plaintext local parts', () => {
  const outputKey = randomBytes(32).toString('base64');
  const legacyEncodingKey = 'public-test-encoding';
  for (const email of ['alice@example.invalid', '雪@example.invalid', 'a+tag@example.invalid']) {
    const [local, domain] = email.split('@');
    const old = `${createHmac('sha256', legacyEncodingKey).update(local).digest('hex')}@${domain}`;
    assert.equal(wrapLegacyEmailPseudonym(old, outputKey), hashGitHubEmail(email, outputKey, legacyEncodingKey));
    assert.notEqual(wrapLegacyEmailPseudonym(old, outputKey), old);
    assert.match(hashGitHubEmail(email, outputKey, legacyEncodingKey), /^[0-9a-f]{64}@example\.invalid$/);
  }
  assert.equal(planEmailChanges([{id: 1, email: null}, {id: 2, email: ''}], outputKey).length, 0);
  const emptyDomain = `${createHmac('sha256', legacyEncodingKey).update('old-invalid-address').digest('hex')}@`;
  assert.match(wrapLegacyEmailPseudonym(emptyDomain, outputKey), /^[0-9a-f]{64}@$/);
  assert.notEqual(wrapLegacyEmailPseudonym(emptyDomain, outputKey), emptyDomain);
  assert.throws(() => planEmailChanges([{id: 1, email: 'unexpected-private-address@example.invalid'}], outputKey), error => !error.message.includes('unexpected-private-address'));
});

test('legacy encoding never substitutes for the required private output key', () => {
  for (const key of [undefined, '', 'weak']) {
    assert.throws(() => assertEmailHashSecret(key), /ENCODE_EMAIL_SECRET_KEY/);
    assert.throws(() => hashGitHubEmail('alice@example.invalid', key, 'public-test-encoding'), /ENCODE_EMAIL_SECRET_KEY/);
  }
  assert.throws(() => hashGitHubEmail('alice@example.invalid', 's'.repeat(32), ''), /cannot be empty/);
});

test('backup encryption is authenticated, recoverable, and randomized', () => {
  const key = randomBytes(32);
  const backup = {changes: [{id: 1, before: 'private-old-pseudonym', after: 'private-new-pseudonym'}]};
  const encrypted = encodeEmailBackup(backup, key);
  assert.deepEqual(decodeEmailBackup(encrypted, key), backup);
  assert.equal(encrypted.includes(Buffer.from('private-old-pseudonym')), false);
  assert.notDeepEqual(encodeEmailBackup(backup, key), encrypted);
  assert.throws(() => decodeEmailBackup(encrypted, randomBytes(32)));
  const modified = Buffer.from(encrypted); modified[modified.length - 1] ^= 1;
  assert.throws(() => decodeEmailBackup(modified, key));
});

test('logs retain only safe error codes and irreversible token fingerprints', () => {
  assert.deepEqual(safeError({message: 'private email', stack: 'private query', code: 'ER_ACCESS_DENIED_ERROR', status: 401, request: {headers: {authorization: 'private token'}}}), {type: 'Error', code: 'ER_ACCESS_DENIED_ERROR', status: 401});
  assert.deepEqual(safeError({code: 'private-token', status: 'private'}), {type: 'Error'});
  const token = 'test-token-with-sensitive-suffix';
  assert.match(eraseToken(token), /^sha256:[0-9a-f]{12}$/);
  assert.equal(eraseToken(token).includes(token.slice(-8)), false);
});

test('revoked and suspended credentials are retired, while rate limits are not', () => {
  assert.equal(isDeadCredential({status: 401}), true);
  assert.equal(isDeadCredential({status: 403, message: 'This account is suspended.'}), true);
  assert.equal(isDeadCredential({status: 403, message: 'API rate limit exceeded'}), false);
  assert.equal(isDeadCredential({status: 429}), false);
});

test('a rejected token cannot return to the worker pool or leak via GitHub error logging', async () => {
  let logOutput = '';
  const logger = pino({level: 'debug'}, {write: value => {logOutput += value;}});
  const factory = new OctokitFactory(['test-healthy-credential', 'test-revoked-credential'], logger);
  const rejected = await factory.create();
  await assert.rejects(rejected.request('GET /user', {request: {
    fetch: async () => new Response(JSON.stringify({message: 'Bad credentials: private-response-value'}), {status: 401, headers: {'content-type': 'application/json'}}),
  }}));
  assert.equal(await factory.validate(rejected), false);
  await factory.destroy(rejected);
  const healthy = await factory.create();
  assert.equal(await factory.validate(healthy), true);
  assert.equal(logOutput.includes('test-revoked-credential'), false);
  assert.equal(logOutput.includes('private-response-value'), false);
  await factory.destroy(healthy);
});

test('GraphQL diagnostics preserve metrics without serializing variables or returned profiles', async () => {
  let logOutput = '';
  const logger = pino({level: 'debug'}, {write: value => {logOutput += value;}});
  const response = {profile: 'private-profile-value', rateLimit: {cost: 1, remaining: 10}};
  const helper = new GitHubHelper(logger, {use: async callback => callback({graphql: async () => response})});
  assert.equal(await helper.queryWithGQL('query { viewer { login } }', {query: 'private-variable-value'}), response);
  assert.equal(logOutput.includes('private-profile-value'), false);
  assert.equal(logOutput.includes('private-variable-value'), false);
  assert.equal(logOutput.includes('costPoints'), true);
});
