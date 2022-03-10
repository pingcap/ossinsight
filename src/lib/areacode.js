import geo from './geo.json'
import code from './code.json'

const geoMap = geo.reduce((p, { code, long, lat }) => {
  p[code] = { long, lat }
  return p
}, {})

export const alpha2ToTitle = (alpha2) => {
  return code[alpha2]
}

export const alpha2ToGeo = (alpha2) => {
  return geoMap[alpha2]
}