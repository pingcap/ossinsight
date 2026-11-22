import {Command} from 'commander';
import {RowDataPacket} from 'mysql2/promise';
import {resolve} from 'path';
import {getConnection} from '../../libs/db/new';
import {digest, EmailRekeyOptions, initializeEmailRekey, readEmailRekeyState, runEmailRekeyBatch} from '../../utils/email-rekey';
import {safeError} from '../../utils/safe-error';

async function main() {
  const program = new Command().description('Back up and rekey legacy GitHub email pseudonyms; defaults to a read-only sample.')
    .option('--apply', 'Apply bounded batches after encrypted backups have been saved.')
    .option('--status', 'Read only the durable migration checkpoint.')
    .option('--backup-dir <path>', 'Private local backup directory.')
    .option('--batch-size <count>', 'Rows read per batch (1-5000).', Number, 1000)
    .option('--max-batches <count>', 'Maximum batches in this invocation.', Number, 10)
    .option('--pause-ms <milliseconds>', 'Delay between batches (at least 100 ms).', Number, 250);
  program.parse();
  const args = program.opts();
  if (!Number.isInteger(args.batchSize) || args.batchSize < 1 || args.batchSize > 5000 ||
    !Number.isInteger(args.maxBatches) || args.maxBatches < 1 || args.maxBatches > 1000000 ||
    !Number.isInteger(args.pauseMs) || args.pauseMs < 100 || args.pauseMs > 60000) throw new Error('Invalid batch limits.');
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is required.');
  const connection = await getConnection({uri: databaseUrl, maxPreparedStatements: 16});
  let deadline: NodeJS.Timeout | undefined;
  const armDeadline = () => {if (deadline) clearTimeout(deadline); deadline = setTimeout(() => connection.destroy(), 120000);};
  armDeadline();
  try {
    if (args.status) {
      const state = await readEmailRekeyState(connection);
      console.log(JSON.stringify({lastId: state.last_id, maxId: state.max_id, scanned: state.scanned, changed: state.changed, complete: Boolean(state.complete)}));
      return;
    }
    if (!args.apply) {
      // The CLI validation above bounds this integer; TiDB rejects DOUBLE-typed
      // prepared LIMIT parameters emitted by mysql2 for JavaScript numbers.
      const [rows] = await connection.query<RowDataPacket[]>(`SELECT /*+ MAX_EXECUTION_TIME(5000) */ id, email FROM github_users ORDER BY id LIMIT ${args.batchSize}`);
      console.log(JSON.stringify({dryRun: true, sampled: rows.length,
        empty: rows.filter(row => row.email === null || row.email === '').length,
        legacy: rows.filter(row => /^[0-9a-f]{64}@[^@]*$/.test(row.email || '')).length,
        unexpected: rows.filter(row => row.email && !/^[0-9a-f]{64}@[^@]*$/.test(row.email)).length}));
      return;
    }
    const backupKey = process.env.EMAIL_REKEY_BACKUP_KEY || '';
    if (!/^[A-Za-z0-9+/]{43}=$/.test(backupKey) || !args.backupDir) throw new Error('A 32-byte base64 backup key and --backup-dir are required.');
    const parsed = new URL(databaseUrl.replace(/^tidb:\/\//, 'mysql://'));
    const options: EmailRekeyOptions = {
      outputKey: process.env.ENCODE_EMAIL_SECRET_KEY || '',
      legacyEncodingKey: process.env.ENCODE_EMAIL_LEGACY_ENCODING_KEY || '',
      backupKey: Buffer.from(backupKey, 'base64'), backupDirectory: resolve(args.backupDir), batchSize: args.batchSize,
      databaseIdentity: digest([parsed.hostname, parsed.port, parsed.username, parsed.pathname].join('\n')),
    };
    let state = await initializeEmailRekey(connection, options);
    for (let batch = 0; batch < args.maxBatches && !state.complete; batch++) {
      armDeadline();
      const started = Date.now();
      state = await runEmailRekeyBatch(connection, options);
      console.log(JSON.stringify({lastId: state.last_id, maxId: state.max_id, scanned: state.scanned, changed: state.changed,
        complete: Boolean(state.complete), elapsedMs: Date.now() - started}));
      if (!state.complete) await new Promise(resolve => setTimeout(resolve, args.pauseMs));
    }
  } finally {
    if (deadline) clearTimeout(deadline);
    await connection.end();
  }
}

main().catch(error => {console.error(JSON.stringify({event: 'email_rekey_failed', error: safeError(error),
  ...(error.code === 'ERR_EMAIL_REKEY_UNKNOWN_FORMAT' ? {rowId: error.rowId} : {})})); process.exitCode = 1;});
