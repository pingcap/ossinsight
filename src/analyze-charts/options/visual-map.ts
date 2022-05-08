import {VisualMapComponentOption} from 'echarts';
import {VisualMapOption} from 'echarts/types/src/component/visualMap/VisualMapModel';
import {darken, lighten} from '@mui/material';
import { isSmall } from './sizes';

export function visualMap(min: number, max: number): VisualMapComponentOption {
  return {
    show: !isSmall(),
    min: 0,
    max: max,
    orient: 'horizontal',
    left: 'center',
    bottom: 8,
  }
}