import { TooltipComponentOption } from 'echarts/components';
import { withBaseOption } from '../base';

const Tooltip = withBaseOption<TooltipComponentOption>(
  'tooltip',
  {},
  'Tooltip',
);

export default Tooltip;
