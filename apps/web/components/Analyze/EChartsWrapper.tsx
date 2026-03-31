'use client';

import React, { useRef } from 'react';
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
  RadarChart as ERadarChart,
  PieChart as EPieChart,
  TreemapChart as ETreemapChart,
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
import { ExportButton, triggerDownload } from '@/components/ui/export-button';

// Must register components BEFORE calling registerMap
echarts.use([
  ELineChart,
  EBarChart,
  EHeatmapChart,
  EBoxplotChart,
  EScatterChart,
  EEffectScatterChart,
  EMapChart,
  ERadarChart,
  EPieChart,
  ETreemapChart,
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
  const chartRef = useRef<ReactEChartsCore>(null);

  // Sanitize style to prevent NaN CSS values
  const safeStyle = style ? Object.fromEntries(
    Object.entries(style).map(([k, v]) => [k, typeof v === 'number' && (isNaN(v) || !isFinite(v)) ? 0 : v])
  ) : style;

  const exportChart = (type: 'png' | 'svg') => {
    const instance = chartRef.current?.getEchartsInstance();
    if (!instance) return;
    try {
      const url = instance.getDataURL({
        type,
        pixelRatio: type === 'png' ? 2 : 1,
        backgroundColor: '#0d1117',
      });
      triggerDownload(url, `chart.${type}`);
    } catch {
      // Canvas may be tainted by cross-origin images (e.g. GitHub avatars)
    }
  };

  return (
    <div className="group/export relative h-full w-full">
      <ReactEChartsCore ref={chartRef} echarts={echarts} style={safeStyle} {...props} />
      <ExportButton
        className="pointer-events-auto absolute right-2 top-2 opacity-0 transition-opacity group-hover/export:opacity-100"
        options={[
          { label: 'Download as PNG', onClick: () => exportChart('png') },
          { label: 'Download as SVG', onClick: () => exportChart('svg') },
        ]}
      />
    </div>
  );
}
