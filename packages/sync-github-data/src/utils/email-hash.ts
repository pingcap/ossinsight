import {createHmac} from 'crypto';

export function assertEmailHashSecret(secret: string | undefined): asserts secret is string {
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw Object.assign(new Error('ENCODE_EMAIL_SECRET_KEY must contain at least 32 bytes; no default key is allowed.'), {code: 'ERR_EMAIL_HASH_KEY_REQUIRED'});
  }
}

export function hashGitHubEmail(email: string | null | undefined, secret: string | undefined, legacyEncodingKey?: string): string {
  if (!email) return '';
  const parts = email.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return '';
  assertEmailHashSecret(secret);
  // Optional compatibility encoding, never a replacement for the private output
  // key. This lets an operator protect existing pseudonyms without recovering
  // plaintext addresses, while keeping fresh imports identical to migrated data.
  const input = legacyEncodingKey === undefined ? parts[0] : legacyLocalPart(parts[0], legacyEncodingKey);
  return `${createHmac('sha256', secret).update(input).digest('hex')}@${parts[1]}`;
}

function legacyLocalPart(localPart: string, key: string): string {
  if (!key) throw new Error('The explicitly configured legacy encoding key cannot be empty.');
  return createHmac('sha256', key).update(localPart).digest('hex');
}

export function wrapLegacyEmailPseudonym(email: string, secret: string | undefined): string {
  assertEmailHashSecret(secret);
  // The legacy importer also encoded addresses with an empty domain. Preserve
  // those opaque values rather than deleting them or inventing a domain.
  if (!/^[0-9a-f]{64}@[^@]*$/.test(email)) throw new Error('Not a legacy email pseudonym.');
  const separator = email.indexOf('@');
  return `${createHmac('sha256', secret).update(email.slice(0, separator)).digest('hex')}${email.slice(separator)}`;
}
