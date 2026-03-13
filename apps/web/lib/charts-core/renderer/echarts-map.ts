import worldMap from '@geo-maps/countries-land-10km';
import { getMap, registerMap } from 'echarts';

if (!getMap('world')) {
  registerMap('world', worldMap());
}
