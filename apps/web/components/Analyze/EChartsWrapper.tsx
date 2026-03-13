'use client';

import React from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import {
  LineChart as ELineChart,
  BarChart as EBarChart,
  HeatmapChart as EHeatmapChart,
  BoxplotChart as EBoxplotChart,
  ScatterChart as EScatterChart,
  EffectScatterChart as EEffectScatterChart,
  MapChart as EMapChart,
} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  LegendComponent,
  DataZoomComponent,
  VisualMapComponent,
  GeoComponent,
  GraphicComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import map from '@geo-maps/countries-land-10km';

// Must register components BEFORE calling registerMap
echarts.use([
  ELineChart,
  EBarChart,
  EHeatmapChart,
  EBoxplotChart,
  EScatterChart,
  EEffectScatterChart,
  EMapChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  LegendComponent,
  DataZoomComponent,
  VisualMapComponent,
  GeoComponent,
  GraphicComponent,
  CanvasRenderer,
]);

if (!echarts.getMap('world')) {
  echarts.registerMap('world', map() as any);
}

export default function EChartsWrapper({ style, ...props }: any) {
  // Sanitize style to prevent NaN CSS values
  const safeStyle = style ? Object.fromEntries(
    Object.entries(style).map(([k, v]) => [k, typeof v === 'number' && (isNaN(v) || !isFinite(v)) ? 0 : v])
  ) : style;
  return <ReactEChartsCore echarts={echarts} style={safeStyle} {...props} />;
}
