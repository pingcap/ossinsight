import {createHash} from 'crypto';
import {PrismaClient} from '@prisma/client';
import {assertEmailHashSecret} from './email-hash';

export async function assertEmailImportReady(prisma: PrismaClient, outputKey: string | undefined, legacyEncodingKey?: string) {
  assertEmailHashSecret(outputKey);
  const [table] = await prisma.$queryRaw<Array<{found: bigint}>>`SELECT COUNT(*) AS found FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'sys_email_rekey_state'`;
  if (Number(table.found) === 0 && legacyEncodingKey === undefined) return;
  if (Number(table.found) === 0) throw Object.assign(new Error('Legacy email encoding requires a completed migration checkpoint.'), {code: 'ERR_EMAIL_MIGRATION_NOT_READY'});
  const [state] = await prisma.$queryRaw<Array<{complete: number; output_key_sha256: string; legacy_key_sha256: string}>>`
    SELECT complete, output_key_sha256, legacy_key_sha256 FROM sys_email_rekey_state
    WHERE migration_id = 'github_users.email.legacy-wrap-v1'`;
  const sha = (value: string) => createHash('sha256').update(value).digest('hex');
  if (!state || !state.complete || state.output_key_sha256 !== sha(outputKey) ||
    !legacyEncodingKey || state.legacy_key_sha256 !== sha(legacyEncodingKey)) {
    throw Object.assign(new Error('Email migration is incomplete or the import key configuration does not match it.'), {code: 'ERR_EMAIL_MIGRATION_NOT_READY'});
  }
}
