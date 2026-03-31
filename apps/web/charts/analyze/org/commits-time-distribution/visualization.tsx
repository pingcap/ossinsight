import { scaleToFit } from '@/lib/charts-utils/utils';

import { ForwardedRef, forwardRef } from 'react';
import {
  DataPoint,
  SingleHeatmap,
  CHART_WIDTH,
  CHART_HEIGHT,
  PADDING_TOP,
} from '@/charts/shared/time-heatmap';

type Input = DataPoint[];

export default function HeatmapViz(data: any, ctx: any) {
  const input = (Array.isArray(data?.[0]) ? data[0] : data) as Input;
  const zone = Number(ctx.parameters?.zone) || 0;

  return (
    <Heatmap
      data={input}
      zone={zone}
      width={ctx.width}
      height={ctx.height}
      dpr={ctx.dpr}
      runtime={ctx.runtime}
    />
  );
}

export const type = 'react-svg';

export const grid = {
  cols: 6,
  rows: 3,
};

interface HeatmapProps {
  data: DataPoint[];
  zone: number;
  width: number;
  height: number;
  dpr: number;
  runtime: 'client' | 'server';
}

const Heatmap = forwardRef(({
  data, zone, width: tw, height: th, dpr, runtime,
}: HeatmapProps, ref: ForwardedRef<SVGSVGElement>) => {
  const totalWidth = CHART_WIDTH;
  const totalHeight = CHART_HEIGHT + PADDING_TOP;

  const { width: realWidth, height: realHeight } = scaleToFit(
    totalWidth, totalHeight,
    tw,
    th,
  );

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={realWidth}
      height={realHeight}
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      display="block"
      ref={ref}
      style={{ backgroundColor: 'transparent' }}
    >
      <g transform={`translate(0, ${PADDING_TOP})`}>
        <SingleHeatmap data={data} zone={zone} />
      </g>
    </svg>
  );
});
