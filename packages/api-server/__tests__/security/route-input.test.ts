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

test('self-hosted clients cannot choose quota identities using forwarding headers', () => {
  expect(publicClientIdentity(new Headers({'x-forwarded-for': '1.2.3.4'}), false)).toBe('shared-origin');
  expect(publicClientIdentity(new Headers({'x-forwarded-for': '5.6.7.8'}), false)).toBe('shared-origin');
  expect(publicClientIdentity(new Headers({'x-forwarded-for': '1.2.3.4'}), true)).toBe('1.2.3.4');
  expect(publicClientIdentity(new Headers({'x-forwarded-for': 'not-an-ip'}), true)).toBe('unknown-client');
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
