import merge from '../../../../apps/web/lib/charts-utils/options/merge';

test('chart option merging preserves callbacks, dates, array order and the original options', () => {
  const formatter = (value: number) => String(value);
  const date = new Date('2026-01-01T00:00:00Z');
  const original = {axisLabel: {formatter}, series: [{name: 'first'}], min: date};
  const result = merge(original, {axisLabel: {margin: 8}, series: [{name: 'second'}]});
  expect(result).toEqual({axisLabel: {formatter, margin: 8}, series: [{name: 'first'}, {name: 'second'}], min: date});
  expect(original).toEqual({axisLabel: {formatter}, series: [{name: 'first'}], min: date});
});

test('prototype-named chart options cannot poison the returned object or global prototype', () => {
  const target = JSON.parse('{"__proto__":{}}');
  const source = JSON.parse('{"__proto__":{"polluted":true},"constructor":{"prototype":{"polluted":true}}}');
  const result = merge(target, source) as Record<string, unknown>;
  expect(result.polluted).toBeUndefined();
  expect(Object.prototype).not.toHaveProperty('polluted');
  expect([Object.prototype, null]).toContain(Object.getPrototypeOf(result));
});
