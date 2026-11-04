import {secureDatabaseURL} from '@ossinsight/types';
import {contentSecurityPolicy} from '../../../../apps/web/lib/content-security';
import {isPublicBudgetPath} from '../../../../apps/web/lib/request-policy';

const remote = 'mysql://analytics:test-only-password@db.example/analytics';
test('remote database connections verify both certificates and hostname by default', () => {
  const url = new URL(secureDatabaseURL(remote));
  expect(JSON.parse(url.searchParams.get('ssl')!)).toEqual({rejectUnauthorized: true, verifyIdentity: true});
  expect(new URL(secureDatabaseURL('mysql://root@127.0.0.1/test')).searchParams.has('ssl')).toBe(false);
});
test.each([false, {rejectUnauthorized: false}, {verifyIdentity: false}, null, 'Amazon RDS'])('unsafe TLS override %s cannot weaken remote connections', ssl => {
  const url = new URL(remote); url.searchParams.set('ssl', JSON.stringify(ssl));
  expect(() => secureDatabaseURL(url.toString())).toThrow();
});
test('explicit custom CA remains available while verification is enforced', () => {
  const url = new URL(remote); url.searchParams.set('ssl', JSON.stringify({ca: 'test-certificate'}));
  expect(JSON.parse(new URL(secureDatabaseURL(url.toString())).searchParams.get('ssl')!)).toMatchObject({ca: 'test-certificate', verifyIdentity: true});
});
test.each(['mysql://root:test-only-password@db.example/analytics', 'mysql://tenant.root:test-only-password@db.example/analytics', 'mysql://root@localhost/test', 'mysql://db.example/analytics', remote + '?host=localhost'])('unsafe production database identity %s is refused', value => {
  expect(() => secureDatabaseURL(value, true)).toThrow();
});
test('production script policy uses a nonce and denies arbitrary inline scripts and evaluation', () => {
  const policy = contentSecurityPolicy('abcdef0123456789abcdef0123456789');
  const script = policy.split('; ').find(value => value.startsWith('script-src '))!;
  expect(script).toContain("'nonce-abcdef0123456789abcdef0123456789'");
  expect(script).toContain("'strict-dynamic'");
  expect(script).not.toMatch(/unsafe-inline|unsafe-eval/);
  expect(policy).toContain("object-src 'none'");
  expect(() => contentSecurityPolicy("attacker'; script-src *")).toThrow();
});
test('database-backed homepage rendering shares the public request budget', () => {
  expect(isPublicBudgetPath('/')).toBe(true);
  expect(isPublicBudgetPath('/collections/foo/opengraph-image-1k31zp')).toBe(true);
  expect(isPublicBudgetPath('/api/q/one')).toBe(true);
  expect(isPublicBudgetPath('/analyze/a/b')).toBe(true);
  expect(isPublicBudgetPath('/trending/ai/api')).toBe(true);
});
