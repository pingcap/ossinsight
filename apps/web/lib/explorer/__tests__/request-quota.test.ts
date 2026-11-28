/// <reference types="jest" />
import {checkExplorerQuota} from '../request-quota';
import {explorerRateLimit} from '../../rate-limit';

jest.mock('../../rate-limit', () => ({explorerRateLimit: {limit: jest.fn()}}));
const limit = jest.mocked(explorerRateLimit.limit);
const initialEnv = {...process.env};

beforeEach(() => {
  delete process.env.VERCEL;
  process.env.AUDIT_TRUSTED_CLIENT_IP_HEADER = 'x-gateway-client';
  limit.mockReset();
});
afterEach(() => {process.env = {...initialEnv};});

test('the Explorer budget only uses the canonical gateway address', async () => {
  const headers = new Headers({'x-gateway-client': '2001:db8:0::7', 'x-forwarded-for': '192.0.2.8'});
  limit.mockResolvedValue({success: true, limit: 3, remaining: 2, reset: Date.now(), pending: Promise.resolve()});
  expect(await checkExplorerQuota(headers)).toBeUndefined();
  expect(limit).toHaveBeenCalledWith('2001:db8::7');
});

test('missing identity and unavailable quota stop Explorer work', async () => {
  expect((await checkExplorerQuota(new Headers({'x-real-ip': '192.0.2.7'})))?.status).toBe(503);
  expect(limit).not.toHaveBeenCalled();
  const headers = new Headers({'x-gateway-client': '192.0.2.7'});
  limit.mockResolvedValue({success: true, reason: 'timeout', limit: 3, remaining: 3, reset: Date.now(), pending: Promise.resolve()});
  expect((await checkExplorerQuota(headers))?.status).toBe(503);
  limit.mockRejectedValue(new Error('fixture unavailable'));
  expect((await checkExplorerQuota(headers))?.status).toBe(503);
});

test('an exhausted budget preserves retry and remaining headers', async () => {
  limit.mockResolvedValue({success: false, limit: 3, remaining: 0, reset: Date.now()+60000, pending: Promise.resolve()});
  const result = await checkExplorerQuota(new Headers({'x-gateway-client': '192.0.2.7'}));
  expect(result?.status).toBe(429);
  expect(result?.headers.get('X-RateLimit-Remaining')).toBe('0');
  expect(Number(result?.headers.get('Retry-After'))).toBeGreaterThan(0);
});
