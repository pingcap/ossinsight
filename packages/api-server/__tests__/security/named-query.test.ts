import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { prepareQueryParameters, querySQLLiteral } from '@ossinsight/types';
import { QueryLegacyParser } from '../../src/core/runner/query/QueryLegacyParser';
import { QueryLiquidParser } from '../../src/core/runner/query/QueryLiquidParser';
import { applyLegacyQueryParameters, prepareQueryContext } from '../../../../apps/web/lib/data-service/executor/utils';

const config: any = { params: [{ name: 'ts', replaces: '1653944647', type: 'integer', pattern: '^[0-9]{1,10}$' }] };
const template = 'SELECT FROM_UNIXTIME(1653944647)';

describe('named-query parameter boundaries', () => {
  test.each(['0) OR SLEEP(10)--', '0 UNION SELECT secret FROM sys_users', 'Infinity', '1e999', {}, ['1'], true])(
    'rejects invalid timestamps in both engines: %p', async value => {
      await expect(new QueryLegacyParser().parse(template, config, { ts: value })).rejects.toThrow();
      expect(() => prepareQueryContext(config, { ts: value })).toThrow();
    });
  test('keeps legitimate numeric inputs working', async () => {
    const input = { ts: '1653944647' };
    expect(await new QueryLegacyParser().parse(template, config, input)).toBe(template);
    expect(applyLegacyQueryParameters(config, template, prepareQueryContext(config, input))).toBe(template);
  });
  test('a new unvalidated legacy parameter fails closed', async () => {
    const unchecked: any = { params: [{ name: 'ts', replaces: '1653944647' }] };
    await expect(new QueryLegacyParser().parse(template, unchecked, { ts: '1 UNION SELECT 2' })).rejects.toThrow();
    expect(() => prepareQueryContext(unchecked, { ts: '1 UNION SELECT 2' })).toThrow();
  });
  test('patterns must match the complete scalar and do not coerce objects', () => {
    const params = [{ name: 'id', pattern: '[0-9]+' }];
    expect(() => prepareQueryParameters(params, { id: '12 OR 1=1' })).toThrow();
    expect(() => prepareQueryParameters(params, { id: { toString: () => '12' } })).toThrow();
  });
  test('template lookups exclude inherited properties and accept explicit false', () => {
    const params = [{ name: 'filter', template: { true: 'AND enabled = 1', false: '' } }];
    expect(() => prepareQueryParameters(params, { filter: 'constructor' })).toThrow();
    expect(() => prepareQueryParameters(params, { filter: '__proto__' })).toThrow();
    expect(prepareQueryParameters(params, { filter: false }).filter).toBe('');
  });
  test('arrays are bounded and numbers must be finite and precise', () => {
    const params = [{ name: 'ids', type: 'array', itemType: 'integer', maxArrayLength: 2 }];
    for (const ids of [[], [1, 2, 3], ['Infinity'], [Number.MAX_SAFE_INTEGER + 1], [{}]]) {
      expect(() => prepareQueryParameters(params, { ids })).toThrow();
    }
    expect(prepareQueryParameters(params, { ids: ['1', '2'] }).ids).toEqual([1, 2]);
  });
  test('Liquid cannot receive caller-controlled template-engine options', async () => {
    const parser = new QueryLiquidParser();
    const cfg: any = { params: [{ name: 'id', type: 'integer' }] };
    expect(await parser.parse('SELECT {{id}}', cfg, { id: 42, outputEscape: 'escape', strictVariables: true })).toBe('SELECT 42');
  });
  test('text SQL literals never contain caller-provided syntax', () => {
    const value = "evil\\' OR 1=1 --";
    const literal = querySQLLiteral(value);
    expect(literal).toMatch(/^CONVERT\(X'[0-9a-f]+' USING utf8mb4\)$/);
    expect(literal).not.toContain(value);
  });
});

describe('row limits in the organization ranking queries', () => {
  const catalogs = ['configs/queries', 'apps/web/lib/data-service/endpoints'];
  const rankings = [
    'orgs/participants/active/ranking', 'orgs/participants/new/ranking',
    'orgs/participants/locations', 'orgs/participants/organizations',
    'orgs/stars/locations', 'orgs/stars/organizations',
  ];

  test.each(catalogs)('enforces the row limit when rendering each catalog in %s', async catalog => {
    for (const ranking of rankings) {
      const directory = resolve(__dirname, '../../../..', catalog, ranking);
      const config = JSON.parse(readFileSync(resolve(directory, 'params.json'), 'utf8'));
      const template = readFileSync(resolve(directory, 'template.sql'), 'utf8');
      const input = { ownerId: 42, repoIds: [7] };
      const parser = new QueryLiquidParser();
      const defaultLimit = config.params.find((param: { name: string }) => param.name === 'n').default;
      const defaultSQL = await parser.parse(template, config, input);
      expect(defaultSQL.trim()).toMatch(new RegExp(`LIMIT\\s+${defaultLimit}$`, 'i'));
      for (const value of [0, '7', 1000]) {
        const params = { ...input, n: value };
        expect(prepareQueryContext(config, params).n).toBe(Number(value));
        const sql = await parser.parse(template, config, params);
        expect(sql.trim()).toMatch(new RegExp(`LIMIT\\s+${Number(value)}$`, 'i'));
      }
      for (const value of [-1, 5.5, 1001]) {
        const params = { ...input, n: value };
        expect(() => prepareQueryContext(config, params)).toThrow();
        await expect(parser.parse(template, config, params)).rejects.toThrow();
      }
    }
  });
});
