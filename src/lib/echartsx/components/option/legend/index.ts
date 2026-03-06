import { LegendComponentOption } from 'echarts/components';
import { withBaseOption } from '../base';

const Legend = withBaseOption<LegendComponentOption>(
  'legend',
  {},
  'Legend',
);

export default Legend;
