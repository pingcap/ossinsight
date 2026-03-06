import geo from './geo.json';
import code from './code.json';

const geoMap: Record<string, { long: number; lat: number }> = (
  geo as Array<{ code: string; lat: number; long: number }>
).reduce((p, { code, long, lat }) => {
  p[code] = { long, lat };
  return p;
}, {} as any);

export const alpha2ToTitle = (alpha2: string) => {
  if (alpha2 === 'UND') return 'Unknown';
  return (code as Record<string, string>)[alpha2];
};

export const alpha2ToGeo = (alpha2: string) => {
  return geoMap[alpha2];
};
