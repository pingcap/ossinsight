import {createCipheriv, createDecipheriv, createHash, randomBytes} from 'crypto';
import {promises as fs} from 'fs';
import {join} from 'path';
import {gzipSync, gunzipSync} from 'zlib';
import {Connection, ResultSetHeader, RowDataPacket} from 'mysql2/promise';
import {assertEmailHashSecret, wrapLegacyEmailPseudonym} from './email-hash';

export const EMAIL_REKEY_ID = 'github_users.email.legacy-wrap-v1';
const BACKUP_AAD = Buffer.from('ossinsight-email-rekey-backup-v1');
const failure = (code: string, message: string) => Object.assign(new Error(message), {code});

export interface EmailRekeyOptions {
  outputKey: string;
  legacyEncodingKey: string;
  backupKey: Buffer;
  backupDirectory: string;
  databaseIdentity: string;
  batchSize: number;
  minimumFreeBytes?: number;
}

export interface EmailRekeyState extends RowDataPacket {
  migration_id: string;
  output_key_sha256: string;
  legacy_key_sha256: string;
  backup_key_sha256: string;
  database_sha256: string;
  backup_directory_sha256: string;
  max_id: number;
  last_id: number;
  scanned: number;
  changed: number;
  complete: number;
}

interface EmailRow extends RowDataPacket {id: number; email: string | null}
export interface EmailChange {id: number; before: string; after: string}

export function digest(value: string | Buffer): string {
  return createHash('sha256').update(value).digest('hex');
}

function validateOptions(options: EmailRekeyOptions) {
  assertEmailHashSecret(options.outputKey);
  if (!options.legacyEncodingKey || options.backupKey.length !== 32 || !options.databaseIdentity ||
    !Number.isInteger(options.batchSize) || options.batchSize < 1 || options.batchSize > 5000 ||
    (options.minimumFreeBytes !== undefined && (!Number.isSafeInteger(options.minimumFreeBytes) || options.minimumFreeBytes < 0))) {
    throw failure('ERR_EMAIL_REKEY_CONFIG', 'Invalid email rekey configuration.');
  }
}

function validateState(state: EmailRekeyState, options: EmailRekeyOptions) {
  if (state.output_key_sha256 !== digest(options.outputKey) || state.legacy_key_sha256 !== digest(options.legacyEncodingKey) ||
    state.backup_key_sha256 !== digest(options.backupKey) || state.database_sha256 !== digest(options.databaseIdentity) ||
    state.backup_directory_sha256 !== digest(options.backupDirectory)) throw failure('ERR_EMAIL_REKEY_KEY_MISMATCH', 'Migration key/configuration fingerprints do not match the existing checkpoint.');
  for (const value of [state.max_id, state.last_id, state.scanned, state.changed]) {
    if (!Number.isSafeInteger(Number(value)) || Number(value) < 0) throw failure('ERR_EMAIL_REKEY_CHECKPOINT', 'Invalid migration checkpoint.');
  }
}

export function encodeEmailBackup(value: unknown, key: Buffer): Buffer {
  if (key.length !== 32) throw new Error('Backup encryption requires a 32-byte key.');
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(BACKUP_AAD);
  const encrypted = Buffer.concat([cipher.update(gzipSync(Buffer.from(JSON.stringify(value)))), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]);
}

export function decodeEmailBackup(value: Buffer, key: Buffer): unknown {
  const decipher = createDecipheriv('aes-256-gcm', key, value.subarray(0, 12));
  decipher.setAAD(BACKUP_AAD);
  decipher.setAuthTag(value.subarray(12, 28));
  const compressed = Buffer.concat([decipher.update(value.subarray(28)), decipher.final()]);
  return JSON.parse(gunzipSync(compressed, {maxOutputLength: 16 * 1024 * 1024}).toString('utf8'));
}

async function privateDirectory(path: string) {
  await fs.mkdir(path, {recursive: true, mode: 0o700});
  const stat = await fs.lstat(path);
  if (!stat.isDirectory() || stat.isSymbolicLink() || (stat.mode & 0o077) !== 0 ||
    (process.getuid && stat.uid !== process.getuid())) throw failure('ERR_EMAIL_REKEY_BACKUP_PERMISSIONS', 'Backup directory must be owned by this user and private (0700).');
}

async function bindBackupDirectory(options: EmailRekeyOptions) {
  const manifest = JSON.stringify({version: 1, migration: EMAIL_REKEY_ID, database: options.databaseIdentity,
    outputKeySha256: digest(options.outputKey), legacyKeySha256: digest(options.legacyEncodingKey), backupKeySha256: digest(options.backupKey)});
  const path = join(options.backupDirectory, 'manifest.json');
  try {
    const handle = await fs.open(path, 'wx', 0o600);
    try {await handle.writeFile(manifest); await handle.sync();} finally {await handle.close();}
    const directory = await fs.open(options.backupDirectory, 'r');
    try {await directory.sync();} finally {await directory.close();}
  } catch (error: any) {
    if (error.code !== 'EEXIST') throw error;
  }
  const stat = await fs.lstat(path);
  if (!stat.isFile() || stat.isSymbolicLink() || (stat.mode & 0o077) !== 0 || stat.size > 65536 ||
    await fs.readFile(path, 'utf8') !== manifest) throw failure('ERR_EMAIL_REKEY_BACKUP_BINDING', 'Backup directory belongs to a different database or key configuration.');
}

async function saveBackup(start: number, end: number, changes: EmailChange[], options: EmailRekeyOptions) {
  await privateDirectory(options.backupDirectory);
  const space = await fs.statfs(options.backupDirectory);
  if (space.bavail * space.bsize < (options.minimumFreeBytes ?? 10 * 1024 ** 3)) throw failure('ERR_EMAIL_REKEY_DISK_SPACE', 'Insufficient disk space for a durable migration backup.');
  const path = join(options.backupDirectory, `batch-${start}-${end}.enc`);
  const payload = {version: 1, migration: EMAIL_REKEY_ID, database: options.databaseIdentity,
    outputKeySha256: digest(options.outputKey), legacyKeySha256: digest(options.legacyEncodingKey), start, end, changes};
  try {
    const stat = await fs.lstat(path);
    if (!stat.isFile() || stat.isSymbolicLink() || (stat.mode & 0o077) !== 0) throw failure('ERR_EMAIL_REKEY_BACKUP_INVALID', 'Invalid existing backup file.');
    const previous = decodeEmailBackup(await fs.readFile(path), options.backupKey);
    if (JSON.stringify(previous) !== JSON.stringify(payload)) throw failure('ERR_EMAIL_REKEY_BACKUP_MISMATCH', 'Existing backup does not match this batch; no data was changed.');
    return;
  } catch (error: any) {
    if (error.code !== 'ENOENT') throw error;
  }
  const temporary = `${path}.${randomBytes(8).toString('hex')}.tmp`;
  const handle = await fs.open(temporary, 'wx', 0o600);
  try {await handle.writeFile(encodeEmailBackup(payload, options.backupKey)); await handle.sync();}
  finally {await handle.close();}
  // The checkpoint row is locked throughout this operation, so another worker
  // for the same database cannot race this rename or overwrite a backup.
  await fs.rename(temporary, path);
  const directory = await fs.open(options.backupDirectory, 'r');
  try {await directory.sync();} finally {await directory.close();}
}

export async function initializeEmailRekey(connection: Connection, options: EmailRekeyOptions): Promise<EmailRekeyState> {
  validateOptions(options);
  await privateDirectory(options.backupDirectory);
  await bindBackupDirectory(options);
  // An administrator can bootstrap the schema separately. Resuming a migration
  // with an existing checkpoint table must not require CREATE privileges.
  try {
    await connection.query('SELECT migration_id FROM sys_email_rekey_state LIMIT 0');
  } catch (error: any) {
    if (error.code !== 'ER_NO_SUCH_TABLE') throw error;
    await connection.query(await fs.readFile(join(__dirname, '../../migrations/001_email_rekey_state.sql'), 'utf8'));
  }
  const [last] = await connection.query<RowDataPacket[]>('SELECT /*+ MAX_EXECUTION_TIME(5000) */ id FROM github_users FORCE INDEX (PRIMARY) ORDER BY id DESC LIMIT 1');
  const [first] = await connection.query<RowDataPacket[]>('SELECT /*+ MAX_EXECUTION_TIME(5000) */ id FROM github_users FORCE INDEX (PRIMARY) ORDER BY id LIMIT 1');
  const maximum = Number(last[0]?.id ?? 0);
  if (!Number.isSafeInteger(maximum) || maximum < 0 || Number(first[0]?.id ?? 1) < 1) throw failure('ERR_EMAIL_REKEY_ID_RANGE', 'User IDs exceed the supported migration range.');
  await connection.execute(`INSERT IGNORE INTO sys_email_rekey_state
    (migration_id, output_key_sha256, legacy_key_sha256, backup_key_sha256, database_sha256, backup_directory_sha256, max_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [EMAIL_REKEY_ID, digest(options.outputKey), digest(options.legacyEncodingKey), digest(options.backupKey), digest(options.databaseIdentity), digest(options.backupDirectory), maximum]);
  const state = await readEmailRekeyState(connection);
  validateState(state, options);
  return state;
}

export async function readEmailRekeyState(connection: Connection): Promise<EmailRekeyState> {
  const [rows] = await connection.execute<EmailRekeyState[]>('SELECT * FROM sys_email_rekey_state WHERE migration_id = ?', [EMAIL_REKEY_ID]);
  if (!rows[0]) throw failure('ERR_EMAIL_REKEY_NOT_INITIALIZED', 'Migration checkpoint not found.');
  return rows[0];
}

export function planEmailChanges(rows: Array<{id: number; email: string | null}>, outputKey: string): EmailChange[] {
  assertEmailHashSecret(outputKey);
  return rows.filter(row => row.email !== null && row.email !== '').map(row => {
    if (!Number.isSafeInteger(Number(row.id)) || Number(row.id) < 0) throw new Error('Invalid user ID.');
    // Stop on unexpected encodings rather than guessing, double wrapping, or
    // deleting a stored value. The whole batch remains unchanged on failure.
    try {
      return {id: Number(row.id), before: row.email!, after: wrapLegacyEmailPseudonym(row.email!, outputKey)};
    } catch {
      throw Object.assign(new Error('Unexpected stored email encoding; this batch was not changed.'),
        {code: 'ERR_EMAIL_REKEY_UNKNOWN_FORMAT', rowId: Number(row.id)});
    }
  });
}

export async function runEmailRekeyBatch(connection: Connection, options: EmailRekeyOptions,
  beforeCommit?: () => Promise<void>): Promise<EmailRekeyState> {
  validateOptions(options);
  await connection.query('BEGIN PESSIMISTIC');
  try {
    const [states] = await connection.execute<EmailRekeyState[]>(
      'SELECT * FROM sys_email_rekey_state WHERE migration_id = ? FOR UPDATE', [EMAIL_REKEY_ID]);
    const state = states[0];
    if (!state) throw failure('ERR_EMAIL_REKEY_NOT_INITIALIZED', 'Migration must be initialized before applying a batch.');
    validateState(state, options);
    if (state.complete) {await connection.commit(); return state;}
    // mysql2 sends JavaScript numbers as DOUBLE, which TiDB rejects for a
    // prepared LIMIT. validateOptions restricts this literal to integers 1-5000.
    const [rows] = await connection.execute<EmailRow[]>(
      `SELECT /*+ MAX_EXECUTION_TIME(5000) */ id, email FROM github_users FORCE INDEX (PRIMARY) WHERE id > ? AND id <= ? ORDER BY id LIMIT ${options.batchSize}`,
      [state.last_id, state.max_id]);
    const changes = planEmailChanges(rows, options.outputKey);
    const end = rows.length ? Number(rows[rows.length - 1].id) : Number(state.max_id);
    if (changes.length) {
      await saveBackup(Number(state.last_id), end, changes, options);
      const cases = changes.map(() => 'WHEN ? THEN ?').join(' ');
      const placeholders = changes.map(() => '?').join(',');
      const [result] = await connection.execute<ResultSetHeader>(
        `UPDATE github_users SET email = CASE id ${cases} END WHERE id IN (${placeholders}) AND BINARY email = BINARY CASE id ${cases} END`,
        [...changes.flatMap(row => [row.id, row.after]), ...changes.map(row => row.id), ...changes.flatMap(row => [row.id, row.before])]);
      if (result.affectedRows !== changes.length) throw failure('ERR_EMAIL_REKEY_CONCURRENT_WRITER', 'A concurrent writer changed a profile; this batch was rolled back.');
    }
    const complete = end >= Number(state.max_id) || rows.length < options.batchSize;
    await connection.execute(`UPDATE sys_email_rekey_state SET last_id = ?, scanned = scanned + ?, changed = changed + ?, complete = ?
      WHERE migration_id = ?`, [end, rows.length, changes.length, Number(complete), EMAIL_REKEY_ID]);
    await beforeCommit?.();
    await connection.commit();
    return await readEmailRekeyState(connection);
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}
