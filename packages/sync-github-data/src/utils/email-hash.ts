import {createHmac} from 'crypto';

export function hashGitHubEmail(email: string | null | undefined, secret: string | undefined): string {
  if (!email) return '';
  const parts = email.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return '';
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error('ENCODE_EMAIL_SECRET_KEY must contain at least 32 bytes; no default key is allowed.');
  }
  return `${createHmac('sha256', secret).update(parts[0]).digest('hex')}@${parts[1]}`;
}
