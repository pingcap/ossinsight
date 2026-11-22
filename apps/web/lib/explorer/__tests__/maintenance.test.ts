/// <reference types="jest" />
import { POST } from '../../../app/api/explorer/ask/route';
import { generateObject, streamObject } from 'ai';
import { executeGeneratedExplorerPlan } from '../generated-query';
import { explorerRateLimit } from '../../rate-limit';

jest.mock('ai', () => ({ generateObject: jest.fn(), streamObject: jest.fn() }));
jest.mock('@ai-sdk/openai', () => ({ createOpenAI: jest.fn(() => jest.fn()) }));
jest.mock('../generated-query', () => ({ executeGeneratedExplorerPlan: jest.fn(), EXPLORER_RESULT_LIMIT: 100 }));
jest.mock('../../rate-limit', () => ({ explorerRateLimit: { limit: jest.fn() } }));
jest.mock('../../server/route-audit', () => ({
  withRequestAudit: (_route: string, handler: (request: Request) => Promise<Response>) => handler,
}));

test.each(['not-json', JSON.stringify({ question: 'Count GitHub events', stream: true })])(
  'maintenance refuses requests before parsing, model calls, query execution or rate-limit storage',
  async body => {
    const response = await POST(new Request('https://example.invalid/api/explorer/ask', { method: 'POST', body }));
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toMatchObject({ code: 'EXPLORER_UNDER_MAINTENANCE' });
    expect(generateObject).not.toHaveBeenCalled();
    expect(streamObject).not.toHaveBeenCalled();
    expect(executeGeneratedExplorerPlan).not.toHaveBeenCalled();
    expect(explorerRateLimit.limit).not.toHaveBeenCalled();
  },
);
