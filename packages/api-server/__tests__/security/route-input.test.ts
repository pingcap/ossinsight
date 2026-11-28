import {isGitHubOwner, isGitHubLogin, isGitHubRepository, isCollectionSlug} from '@ossinsight/types';
import {publicClientIdentity, publicBudgetKind, budgetFailure} from '../../../../apps/web/lib/request-policy';

test.each(['%', '%2F', '%252F', 'a/b', 'a\\b', 'a\n', 'a'.repeat(200), {}, null])('invalid decoded route input %s never reaches GitHub lookups', value => {
  expect(isGitHubOwner(value)).toBe(false);
  expect(isGitHubLogin(value)).toBe(false);
  expect(isGitHubRepository(value)).toBe(false);
  expect(isCollectionSlug(value)).toBe(false);
});

test('valid GitHub names include hidden repositories and app bots', () => {
  expect(isGitHubOwner('pingcap')).toBe(true);
  expect(isGitHubLogin('github-actions[bot]')).toBe(true);
  expect(isGitHubRepository('.github')).toBe(true);
  expect(isGitHubRepository('.')).toBe(false);
  expect(isGitHubRepository('..')).toBe(false);
  expect(isGitHubOwner('a'.repeat(40))).toBe(false);
  expect(isGitHubRepository('a'.repeat(101))).toBe(false);
});

test('quota identity requires an address supplied by the configured ingress', () => {
  const old = process.env.AUDIT_TRUSTED_CLIENT_IP_HEADER;
  try {
    delete process.env.AUDIT_TRUSTED_CLIENT_IP_HEADER;
    const forwarded = new Headers({'x-forwarded-for': '192.0.2.7'});
    expect(() => publicClientIdentity(forwarded, false)).toThrow();
    expect(publicClientIdentity(forwarded, true)).toBe('192.0.2.7');
    process.env.AUDIT_TRUSTED_CLIENT_IP_HEADER = 'x-gateway-client';
    expect(() => publicClientIdentity(forwarded, false)).toThrow();
    forwarded.set('x-gateway-client', '2001:db8:0:0::1');
    expect(publicClientIdentity(forwarded, false)).toBe('2001:db8::1');
    forwarded.set('x-gateway-client', '192.0.2.7, 192.0.2.8');
    expect(() => publicClientIdentity(forwarded, false)).toThrow();
  } finally {
    if (old === undefined) delete process.env.AUDIT_TRUSTED_CLIENT_IP_HEADER;
    else process.env.AUDIT_TRUSTED_CLIENT_IP_HEADER = old;
  }
});

test('query aliases and cache-busting paths cannot acquire separate budgets', () => {
  expect(publicBudgetKind('/q/one')).toBe('query');
  expect(publicBudgetKind('/api/q/two')).toBe('query');
  expect(publicBudgetKind('/analyze/a/b/opengraph-image')).toBe('image');
  expect(publicBudgetKind('/collections/foo/twitter-image')).toBe('image');
  expect(publicBudgetKind('/analyze/a/b/opengraph-image-1k31zp')).toBe('image');
  expect(publicBudgetKind('/collections/foo/twitter-image-1k31zp')).toBe('image');
});

test('a fail-open Redis timeout is rejected even when the SDK says success', () => {
  expect(budgetFailure({success: true, reason: 'timeout', reset: 1000})).toMatchObject({status: 503});
  expect(budgetFailure({success: false, reset: 4000}, 1000)).toMatchObject({status: 429, retryAfter: 3});
  expect(budgetFailure({success: true, reset: 4000})).toBeNull();
});

test('homepage polling shares a separate bounded budget across aliases without widening other queries', () => {
  for (const query of ['events-total', 'events-increment', 'events-increment-intervals']) {
    expect(publicBudgetKind(`/api/q/${query}`)).toBe('realtime');
    expect(publicBudgetKind(`/q/${query}`)).toBe('realtime');
    expect(publicBudgetKind(`/api/q/${query}/`)).toBe('realtime');
    expect(publicBudgetKind(`/api/q/${query}/other`)).toBe('query');
    expect(publicBudgetKind(`/api/q/${query}-other`)).toBe('query');
  }
  expect(publicBudgetKind('/api/q/analyze-repo-stars')).toBe('query');
  expect(publicBudgetKind('/api/q/explain/events-total')).toBe('query');
});
