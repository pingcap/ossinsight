import geo from './geo.json';
import code from './code.json';

const codeMap = code as Record<string, string>;

const geoMap: Record<string, { long: number, lat: number }> = geo.reduce<Record<string, { long: number, lat: number }>>((p, { code, long, lat }) => {
  p[code] = { long, lat };
  return p;
}, {});

export const alpha2ToTitle = (alpha2: string) => {
  return codeMap[alpha2];
};

export const alpha2ToGeo = (alpha2: string) => {
  return geoMap[alpha2];
};
