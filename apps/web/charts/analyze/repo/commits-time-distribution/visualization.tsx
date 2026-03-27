import type { WidgetVisualizerContext } from '@/lib/charts-types';
import { scaleToFit } from '@/lib/charts-utils/utils';

import { compare } from '@/lib/charts-utils/visualizer/analyze';
import { ForwardedRef, forwardRef, useMemo } from 'react';

type Params = {
  repo_id: string;
  period?: string;
  zone?: string;
  vs_repo_id?: string;
};

type DataPoint = {
  dayofweek: number;
  hour: number;
  pushes: number;
};

type Input = [DataPoint[], DataPoint[] | undefined];

const times = Array(24).fill(0).map((_, i) => i);
const days = Array(7).fill(0).map((_, i) => i);
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const COLORS = ['#2C2C2C', '#00480D', '#017420', '#34A352', '#6CDE8C', '#B5FFC9'];

function getColor(num: number, max: number): string {
  if (num === 0) return COLORS[0];
  const d = num / max;
  if (d < 1 / 5) return COLORS[1];
  if (d < 2 / 5) return COLORS[2];
  if (d < 3 / 5) return COLORS[3];
  if (d < 4 / 5) return COLORS[4];
  return COLORS[5];
}

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

const SIZE = 16;
const GAP = 3;
const PADDING_LEFT = 28;
const PADDING_TOP = 24;
const CHART_WIDTH = SIZE * 24 + GAP * 23 + PADDING_LEFT;
const CHART_HEIGHT = SIZE * 7 + GAP * 6 + 40;

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

function SingleHeatmap({ data, zone }: { data: DataPoint[]; zone: number }) {
  const max = useMemo(
    () => data.reduce((m, d) => Math.max(m, d.pushes), 0),
    [data],
  );

  return (
    <g>
      {/* Background cells */}
      {times.map((time) =>
        days.map((day) => (
          <rect
            key={`bg-${time}-${day}`}
            x={PADDING_LEFT + time * (SIZE + GAP)}
            y={day * (SIZE + GAP)}
            width={SIZE}
            height={SIZE}
            rx={3}
            ry={3}
            fill={COLORS[0]}
          />
        ))
      )}
      {/* Data cells */}
      {data.map(({ dayofweek: day, pushes, hour: time }) => (
        <rect
          key={`d-${time}-${day}`}
          x={PADDING_LEFT + ((24 + time + zone) % 24) * (SIZE + GAP)}
          y={day * (SIZE + GAP)}
          width={SIZE}
          height={SIZE}
          rx={3}
          ry={3}
          fill={getColor(pushes, max)}
        />
      ))}
      {/* Day labels */}
      {DAY_NAMES.map((name, day) => (
        <text
          key={name}
          y={day * (SIZE + GAP) + SIZE - 4}
          x={PADDING_LEFT - 6}
          textAnchor="end"
          fontSize={11}
          fill="#666"
          fontFamily="monospace"
        >
          {name}
        </text>
      ))}
      {/* Hour labels */}
      {times.filter((t) => t % 3 === 0).map((time) => (
        <text
          key={time}
          y={7 * (SIZE + GAP) + 14}
          x={PADDING_LEFT + time * (SIZE + GAP) + SIZE / 2}
          textAnchor="middle"
          fontSize={10}
          fill="#666"
          fontFamily="monospace"
        >
          {time}
        </text>
      ))}
      {/* Legend */}
      <g transform={`translate(${PADDING_LEFT}, ${7 * (SIZE + GAP) + 26})`}>
        <text fontSize={10} fill="#888" y={SIZE - 4}>less</text>
        {COLORS.map((color, i) => (
          <rect
            key={color}
            fill={color}
            x={30 + i * (SIZE + 3)}
            y={0}
            width={SIZE}
            height={SIZE}
            rx={3}
            ry={3}
          />
        ))}
        <text fontSize={10} fill="#888" x={38 + COLORS.length * (SIZE + 3)} y={SIZE - 4}>more</text>
      </g>
    </g>
  );
}
