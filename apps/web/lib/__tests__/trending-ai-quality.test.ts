import {renderToStaticMarkup} from 'react-dom/server';
import {GET} from '../../app/trending/ai/api/route';
import TrendingAIPage from '../../app/trending/ai/page';
import {getCollectionRanking} from '../server/internal-api';
import {isAITrendingRankingUnavailable} from '../data-quality';

jest.mock('../server/route-audit', () => ({
  withRequestAudit: (_label: string, handler: unknown) => handler,
}));
jest.mock('../server/internal-api', () => ({
  getCollectionRanking: jest.fn(),
  jsonResponse: (value: unknown, init?: ResponseInit) => Response.json(value, init),
}));
jest.mock('../data-quality', () => ({
  ...jest.requireActual('../data-quality'), isAITrendingRankingUnavailable: jest.fn(),
}));
jest.mock('../../app/trending/ai/content', () => ({TrendingAIContent: () => null}));
jest.mock('../../components/json-ld', () => ({
  BreadcrumbListJsonLd: () => null, FAQPageJsonLd: () => null, ItemListJsonLd: () => null,
}));

beforeEach(() => jest.clearAllMocks());

test('suppressed rankings have an explicit uncached response and a visible page notice', async () => {
  jest.mocked(isAITrendingRankingUnavailable).mockReturnValue(true);
  const response = await GET(new Request('https://example.test/trending/ai/api'));
  expect(response.headers.get('cache-control')).toBe('no-store');
  expect(await response.json()).toMatchObject({repos: [], categories: [], data_quality: {status: 'unavailable'}});
  expect(renderToStaticMarkup(await TrendingAIPage())).toContain('role="status"');
  expect(getCollectionRanking).not.toHaveBeenCalled();
});

test('available rankings retain the existing response shape', async () => {
  jest.mocked(isAITrendingRankingUnavailable).mockReturnValue(false);
  jest.mocked(getCollectionRanking).mockResolvedValue({data: []} as any);
  const response = await GET(new Request('https://example.test/trending/ai/api'));
  expect(response.status).toBe(200);
  const body = await response.json();
  expect(body.repos).toEqual([]);
  expect(body.categories).toContainEqual({id: 10108, category: 'RAG', count: 0, topRepo: ''});
  expect(body).not.toHaveProperty('data_quality');
  expect(getCollectionRanking).toHaveBeenCalledTimes(body.categories.length);
});
