import { registerThemeDark } from '@site/src/components/BasicCharts';
import { isNullish } from '@site/src/utils/value';
import map from '@geo-maps/countries-land-10km';
import { getMap, registerMap, use } from 'echarts/core';
import { BarChart, LinesChart, PieChart, ScatterChart } from 'echarts/charts';
import { DatasetComponent, GridComponent, LegendComponent, SingleAxisComponent, TitleComponent, ToolboxComponent, TooltipComponent, TransformComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { LabelLayout, UniversalTransition } from 'echarts/features';

registerThemeDark();

if (isNullish(getMap('world'))) {
  registerMap('world', map());
}

use([
  BarChart,
  LinesChart,
  PieChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  CanvasRenderer,
  LabelLayout,
  TransformComponent,
  UniversalTransition,
  ToolboxComponent,
  SingleAxisComponent,
  DatasetComponent,
  LegendComponent,
  ScatterChart,
]);

export { default as ECharts } from './ECharts';
export * from './EChartsx';
export * as echarts from 'echarts/core';
