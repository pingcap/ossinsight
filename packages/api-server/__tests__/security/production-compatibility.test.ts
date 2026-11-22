import pino from 'pino';
import {TiDBDataService} from '../../src/plugins/services/tidb-data-service';
import {STAR_DATA_UNAVAILABLE_MARKER, getPublicApiDataQuality} from '../../src/utils/data-quality';

test('missing Data Service endpoints remain 404 without leaking upstream credentials', async () => {
  const service = new TiDBDataService(pino({enabled: false}), 'fixture', 'fixture', 'fixture');
  (service as any).client = {get: jest.fn().mockRejectedValue({isAxiosError: true, response: {status: 404},
    config: {headers: {Authorization: 'private credential'}}})};
  let error: any;
  try { await service.request('/repos'); } catch (caught) {error = caught;}
  expect(error.statusCode).toBe(404);
  expect(JSON.stringify(error)).not.toContain('private');
  expect(error.cause).toBeUndefined();
});

test('production data-quality gates retain valid fallback routes', () => {
  expect(STAR_DATA_UNAVAILABLE_MARKER.alternative).toContain('/gh/repos/{owner}/{repo}');
  expect(STAR_DATA_UNAVAILABLE_MARKER.alternative).toContain('/v1/collections/{id}/repos');
  expect(getPublicApiDataQuality('/collections/hot')).toBe('blocked');
});
