import worldMap from '@geo-maps/countries-land-10km';
import { getMap, registerMap } from 'echarts/core';

if (!getMap('world')) {
  registerMap('world', worldMap());
}
