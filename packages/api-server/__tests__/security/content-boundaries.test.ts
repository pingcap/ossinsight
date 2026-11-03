import {serializeScriptJSON} from '../../../site-shell/src/safe-json';
import {hashGitHubEmail} from '../../../sync-github-data/src/utils/email-hash';

test('untrusted structured data cannot close its HTML script element', () => {
  const data = {
    description: '</script><img src=x onerror=alert(1)>',
    slug: '<!-- & \u2028 \u2029',
    literal: '\\u003c',
  };
  const serialized = serializeScriptJSON(data);
  expect(serialized).not.toMatch(/[<>&\u2028\u2029]/);
  expect(JSON.parse(serialized)).toEqual(data);
});

test.each([undefined, '', 'secret-key', 'short'])('email imports fail closed with weak or missing key %s', key => {
  expect(() => hashGitHubEmail('alice@example.com', key)).toThrow('ENCODE_EMAIL_SECRET_KEY');
});

test('email pseudonyms depend on the configured private key and preserve no local-part text', () => {
  const first = hashGitHubEmail('alice@example.com', 'a'.repeat(32));
  const second = hashGitHubEmail('alice@example.com', 'b'.repeat(32));
  expect(first).toMatch(/^[a-f0-9]{64}@example\.com$/);
  expect(first).not.toBe(second);
  expect(first).not.toContain('alice');
  expect(hashGitHubEmail('alice@example.com', 'a'.repeat(32))).toBe(first);
});
