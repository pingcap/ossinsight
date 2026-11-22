import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isSuppressedRequest, parseSuppressedAccounts } from '../lib/suppression';

const accounts = parseSuppressedAccounts('Example-User:4242, other:7');
const blocked = (path: string) => isSuppressedRequest(new URL(path, 'https://next.ossinsight.io'), accounts);

test('login:id pairs are parsed and malformed entries are ignored', () => {
  assert.deepEqual(accounts, [{ login: 'example-user', id: '4242' }, { login: 'other', id: '7' }]);
  assert.deepEqual(parseSuppressedAccounts(undefined), []);
  assert.deepEqual(parseSuppressedAccounts('no-id, :5, bad/login:1, name:abc'), []);
});

test('widgets and pages about a suppressed account are blocked', () => {
  assert.equal(blocked('/widgets/official/compose-user-dashboard-stats/thumbnail.png?user_id=4242&image_size=auto'), true);
  assert.equal(blocked('/widgets/official/compose-user-dashboard-stats?user_id=4242'), true);
  assert.equal(blocked('/widgets/official/compose-org-active-contributors/thumbnail.png?owner_id=7&activity=active'), true);
  assert.equal(blocked('/analyze/Example-User'), true);
});

test('other requests are left alone', () => {
  assert.equal(blocked('/widgets/official/compose-user-dashboard-stats/thumbnail.png?user_id=42420'), false);
  assert.equal(blocked('/widgets/official/analyze-repo-stars-history/thumbnail.png?repo_id=4242'), false);
  assert.equal(blocked('/analyze/example-user-2'), false);
  assert.equal(blocked('/widgets'), false);
  assert.equal(isSuppressedRequest(new URL('https://next.ossinsight.io/analyze/example-user'), []), false);
});
