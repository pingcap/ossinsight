import { countries } from 'country-data'

// TODO: shrink data size

const map = countries.all.reduce((p, c) => {
  p.alpha3 = p.alpha3 || {}
  p.name = p.name || {}
  p.alpha3[c.alpha2] = c.alpha3
  p.name[c.alpha3] = c.name
  return p
}, {})

// see https://github.com/OpenBookPrices/country-data
export const alpha2ToAlpha3 = (alpha2) => {
  return map.alpha3[alpha2]
}

export const alpha3ToTitle = (alpha3) => {
  return map.name[alpha3]
}