import {createHmac, randomBytes} from 'crypto';
import {promises as fs} from 'fs';
import {tmpdir} from 'os';
import {join} from 'path';
import {RowDataPacket} from 'mysql2/promise';
import {bootstrapTestDatabase, getTestDatabase, releaseTestDatabase} from '../helpers/db';
import {decodeEmailBackup, EmailRekeyOptions, initializeEmailRekey, readEmailRekeyState, runEmailRekeyBatch} from '../../../sync-github-data/src/utils/email-rekey';
import {hashGitHubEmail} from '../../../sync-github-data/src/utils/email-hash';
import {assertEmailImportReady} from '../../../sync-github-data/src/utils/email-key-policy';
import {createSecurePrismaClient} from '../../../sync-github-data/src/libs/db/prisma';
import {getConnection} from '../../../sync-github-data/src/libs/db/new';

let connection: Awaited<ReturnType<typeof getConnection>>;
let maintenanceUrl: string;
let options: EmailRekeyOptions;
const legacyEncodingKey = 'public-integration-test-encoding';
const oldEmail = (local: string) => `${createHmac('sha256', legacyEncodingKey).update(local).digest('hex')}@example.invalid`;

beforeAll(async () => {
  const database = await bootstrapTestDatabase();
  // Maintenance DDL needs the isolated container administrator. Keep the API
  // executor/analytics roles unchanged so their denial tests remain meaningful.
  const url = new URL(database.rootUrl());
  url.pathname = `/${database.database}`;
  maintenanceUrl = url.toString();
  connection = await getConnection({uri: maintenanceUrl});
});

beforeEach(async () => {
  await connection.query('DROP TABLE IF EXISTS sys_email_rekey_state');
  await connection.query('TRUNCATE TABLE github_users');
  options = {outputKey: randomBytes(32).toString('base64'), legacyEncodingKey, backupKey: randomBytes(32),
    backupDirectory: await fs.mkdtemp(join(tmpdir(), 'ossinsight-email-rekey-')), databaseIdentity: 'isolated-test-database', batchSize: 2, minimumFreeBytes: 0};
  for (const [id, email] of [[1, oldEmail('alice')], [2, ''], [3, oldEmail('bob')], [5, oldEmail('alice')]]) {
    await connection.execute(`INSERT INTO github_users (id, login, email, stars_total, created_at, updated_at)
      VALUES (?, ?, ?, 0, '2026-01-01 00:00:00', '2026-01-01 00:00:00')`, [id, `fixture-${id}`, email]);
  }
});

afterEach(async () => {if (options?.backupDirectory) await fs.rm(options.backupDirectory, {recursive: true, force: true});});
afterAll(async () => {await connection?.end(); await releaseTestDatabase();});

async function emails() {
  const [rows] = await connection.query<RowDataPacket[]>('SELECT id, email FROM github_users ORDER BY id');
  return rows;
}

test('a separately bootstrapped migration runs without granting CREATE to the maintenance account', async () => {
  await initializeEmailRekey(connection, options);
  await connection.query('DELETE FROM sys_email_rekey_state');
  const username = `email_rekey_${randomBytes(6).toString('hex')}`;
  const password = randomBytes(24).toString('base64');
  const database = getTestDatabase().database;
  let limited: Awaited<ReturnType<typeof getConnection>> | undefined;
  await connection.query("CREATE USER ?@'%' IDENTIFIED BY ?", [username, password]);
  try {
    await connection.query("GRANT SELECT, UPDATE ON ?? TO ?@'%'", [`${database}.github_users`, username]);
    await connection.query("GRANT SELECT, INSERT, UPDATE ON ?? TO ?@'%'", [`${database}.sys_email_rekey_state`, username]);
    const url = new URL(maintenanceUrl);
    url.username = username;
    url.password = password;
    limited = await getConnection({uri: url.toString()});
    await expect(limited.query('CREATE TABLE denied_migration_fixture (id INT)')).rejects.toThrow(/denied/i);
    await initializeEmailRekey(limited, options);
    await runEmailRekeyBatch(limited, options);
    const state = await runEmailRekeyBatch(limited, options);
    expect(Number(state.complete)).toBe(1);
    expect(Number(state.changed)).toBe(3);
  } finally {
    await limited?.end();
    await connection.query("DROP USER IF EXISTS ?@'%'", [username]);
  }
});

test('bounded batches preserve domains/equality, resume exactly once, and retain recoverable backups', async () => {
  const original = await emails();
  await initializeEmailRekey(connection, options);
  const first = await runEmailRekeyBatch(connection, options);
  expect(Number(first.last_id)).toBe(2);
  expect(Number(first.changed)).toBe(1);
  await initializeEmailRekey(connection, options);
  const complete = await runEmailRekeyBatch(connection, options);
  expect(Number(complete.scanned)).toBe(4);
  expect(Number(complete.changed)).toBe(3);
  expect(complete.complete).toBe(1);
  const migrated = await emails();
  expect(migrated.map(row => row.email)).toEqual([
    hashGitHubEmail('alice@example.invalid', options.outputKey, legacyEncodingKey), '',
    hashGitHubEmail('bob@example.invalid', options.outputKey, legacyEncodingKey),
    hashGitHubEmail('alice@example.invalid', options.outputKey, legacyEncodingKey),
  ]);
  await runEmailRekeyBatch(connection, options);
  expect(await emails()).toEqual(migrated);
  const recovered: Array<{id: number; email: string}> = [];
  for (const name of (await fs.readdir(options.backupDirectory)).filter(name => name.endsWith('.enc'))) {
    const path = join(options.backupDirectory, name);
    expect((await fs.stat(path)).mode & 0o077).toBe(0);
    const backup = decodeEmailBackup(await fs.readFile(path), options.backupKey) as any;
    recovered.push(...backup.changes.map((change: any) => ({id: change.id, email: change.before})));
  }
  expect(recovered.sort((a, b) => a.id - b.id)).toEqual(original.filter(row => row.email));
});

test('failure after writes rolls back both data and checkpoint; durable backup can be reused', async () => {
  const original = await emails();
  await initializeEmailRekey(connection, options);
  await expect(runEmailRekeyBatch(connection, options, async () => {throw new Error('Injected pre-commit failure');})).rejects.toThrow('Injected');
  expect(await emails()).toEqual(original);
  expect(Number((await readEmailRekeyState(connection)).last_id)).toBe(0);
  expect((await fs.readdir(options.backupDirectory)).filter(name => name.endsWith('.enc'))).toHaveLength(1);
  const retried = await runEmailRekeyBatch(connection, options);
  expect(Number(retried.changed)).toBe(1);
  expect((await emails())[0].email).toBe(hashGitHubEmail('alice@example.invalid', options.outputKey, legacyEncodingKey));
});

test('concurrent migrators serialize checkpoint access without double wrapping', async () => {
  await initializeEmailRekey(connection, options);
  const other = await getConnection({uri: maintenanceUrl});
  try {await Promise.all([runEmailRekeyBatch(connection, options), runEmailRekeyBatch(other, options)]);}
  finally {await other.end();}
  const state = await readEmailRekeyState(connection);
  expect(Number(state.scanned)).toBe(4);
  expect(Number(state.changed)).toBe(3);
  expect(state.complete).toBe(1);
  expect((await emails())[0].email).toBe((await emails())[3].email);
});

test('connection loss before commit leaves data recoverable and the cursor unchanged', async () => {
  const original = await emails();
  await initializeEmailRekey(connection, options);
  const interrupted = await getConnection({uri: maintenanceUrl});
  await expect(runEmailRekeyBatch(interrupted, options, async () => {
    interrupted.destroy();
    throw new Error('Injected connection loss');
  })).rejects.toThrow();
  expect(await emails()).toEqual(original);
  expect(Number((await readEmailRekeyState(connection)).last_id)).toBe(0);
  await runEmailRekeyBatch(connection, options);
  expect(Number((await readEmailRekeyState(connection)).changed)).toBe(1);
});

test('wrong keys and insufficient backup space cannot advance or modify a batch', async () => {
  const original = await emails();
  await initializeEmailRekey(connection, options);
  await expect(runEmailRekeyBatch(connection, {...options, outputKey: randomBytes(32).toString('base64')})).rejects.toThrow('fingerprints');
  await expect(runEmailRekeyBatch(connection, {...options, databaseIdentity: 'different-database'})).rejects.toThrow('fingerprints');
  await expect(runEmailRekeyBatch(connection, {...options, minimumFreeBytes: Number.MAX_SAFE_INTEGER})).rejects.toThrow('disk space');
  expect(await emails()).toEqual(original);
  expect(Number((await readEmailRekeyState(connection)).last_id)).toBe(0);
});

test('unrecognized stored values stop the whole batch without exposing or erasing them', async () => {
  await connection.execute('UPDATE github_users SET email = ? WHERE id = 2', ['unexpected-private-value']);
  const original = await emails();
  await initializeEmailRekey(connection, options);
  await expect(runEmailRekeyBatch(connection, options)).rejects.toMatchObject({code: 'ERR_EMAIL_REKEY_UNKNOWN_FORMAT', rowId: 2});
  expect(await emails()).toEqual(original);
  expect(Number((await readEmailRekeyState(connection)).last_id)).toBe(0);
});

test('an importer cannot start until migration is complete with the same output and legacy keys', async () => {
  const prisma = createSecurePrismaClient(getTestDatabase().url());
  try {
    await expect(assertEmailImportReady(prisma, options.outputKey)).resolves.toBeUndefined();
    await expect(assertEmailImportReady(prisma, options.outputKey, legacyEncodingKey)).rejects.toThrow('checkpoint');
    await initializeEmailRekey(connection, options);
    await expect(assertEmailImportReady(prisma, options.outputKey, legacyEncodingKey)).rejects.toThrow('incomplete');
    await runEmailRekeyBatch(connection, options);
    await runEmailRekeyBatch(connection, options);
    await expect(assertEmailImportReady(prisma, options.outputKey, legacyEncodingKey)).resolves.toBeUndefined();
    await expect(assertEmailImportReady(prisma, options.outputKey)).rejects.toThrow('configuration');
    await expect(assertEmailImportReady(prisma, 'different-output-key-with-at-least-32-bytes', legacyEncodingKey)).rejects.toThrow('configuration');
  } finally {await prisma.$disconnect();}
});
