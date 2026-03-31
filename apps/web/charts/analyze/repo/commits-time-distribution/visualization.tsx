import type { WidgetVisualizerContext } from '@/lib/charts-types';
import { scaleToFit } from '@/lib/charts-utils/utils';

import { compare } from '@/lib/charts-utils/visualizer/analyze';
import { ForwardedRef, forwardRef } from 'react';
import {
  DataPoint,
  SingleHeatmap,
  CHART_WIDTH,
  CHART_HEIGHT,
  PADDING_LEFT,
  PADDING_TOP,
} from '@/charts/shared/time-heatmap';

type Params = {
  repo_id: string;
  period?: string;
  zone?: string;
  vs_repo_id?: string;
};

type Input = [DataPoint[], DataPoint[] | undefined];

export default function (input: Input, ctx: WidgetVisualizerContext<Params>) {
  const main = ctx.getRepo(parseInt(ctx.parameters.repo_id));
  const vs = ctx.getRepo(parseInt(ctx.parameters.vs_repo_id ?? ''));
  const hasVs = !!vs;
  const zone = Number(ctx.parameters.zone) || 0;

  const datasets = compare(input, (data) => data);

  return (
    <HeatmapGroup
      datasets={datasets}
      labels={[main?.fullName, vs?.fullName].filter(Boolean) as string[]}
      hasVs={hasVs}
      zone={zone}
      width={ctx.width}
      height={ctx.height}
      dpr={ctx.dpr}
      runtime={ctx.runtime}
    />
  );
}

export const type = 'react-svg';

interface HeatmapGroupProps {
  datasets: DataPoint[][];
  labels: string[];
  hasVs: boolean;
  zone: number;
  width: number;
  height: number;
  dpr: number;
  runtime: 'client' | 'server';
}

const HeatmapGroup = forwardRef(({
  datasets, labels, hasVs, zone, width: tw, height: th, dpr, runtime,
}: HeatmapGroupProps, ref: ForwardedRef<SVGSVGElement>) => {

  const totalWidth = hasVs ? CHART_WIDTH * 2 + 40 : CHART_WIDTH;
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
      {datasets.map((data, i) => (
        <g key={i} transform={`translate(${i * (CHART_WIDTH + 40)}, 0)`}>
          {hasVs && (
            <text x={PADDING_LEFT} y={12} fontSize={12} fill="#999" fontFamily="monospace">
              {labels[i]}
            </text>
          )}
          <g transform={`translate(0, ${hasVs ? 20 : 0})`}>
            <SingleHeatmap data={data} zone={zone} />
          </g>
        </g>
      ))}
    </svg>
  );
});
