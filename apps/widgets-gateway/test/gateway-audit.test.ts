import assert from 'node:assert/strict';
import {test} from 'node:test';

test('the gateway reports its routing decision without request data', async t => {
  const previous = process.env.SUPPRESSED_GITHUB_ACCOUNTS;
  process.env.SUPPRESSED_GITHUB_ACCOUNTS = 'example:42';
  t.after(() => {
    if (previous === undefined) delete process.env.SUPPRESSED_GITHUB_ACCOUNTS;
    else process.env.SUPPRESSED_GITHUB_ACCOUNTS = previous;
  });
  const {default: middleware} = await import('../middleware');
  const log = t.mock.method(console, 'info', () => {});
  const forwarded = middleware(new Request('https://example.test/widgets/vendor/name?sample=value'));
  const removed = middleware(new Request('https://example.test/api/thumbnail?user_id=42'));
  assert.equal(forwarded.headers.get('x-middleware-next'), '1');
  assert.equal(removed.status, 404);
  assert.equal(log.mock.calls.length, 2);
  for (const [index, [route, decision]] of [['widgets', 'forwarded'], ['thumbnail', 'not_found']].entries()) {
    const record = JSON.parse(log.mock.calls[index].arguments[0]);
    assert.equal(typeof record.requestId, 'string');
    assert.deepEqual(record, {event: 'widget_gateway_request', requestId: record.requestId, method: 'GET', route, decision});
  }
});
