import type { WidgetVisualizerContext } from '@/lib/charts-types';
import { CardHeading } from '@/lib/charts-core/renderer/react/builtin/CardHeading';
import { scaleToFit } from '@/lib/charts-utils/utils';

import { ForwardedRef, forwardRef, useMemo } from 'react';

type Params = {
  owner_id: number;
  period?: string;
  zone?: string;
};

type DataPoint = {
  dayofweek: number;
  hour: number;
  pushes: number;
};

type Input = DataPoint[];

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

const SIZE = 16;
const GAP = 3;
const PADDING_LEFT = 28;
const PADDING_TOP = 24;
const CHART_WIDTH = SIZE * 24 + GAP * 23 + PADDING_LEFT;
const CHART_HEIGHT = SIZE * 7 + GAP * 6 + 40;

export default function Card({ data, ctx }: { data: any[]; ctx: any }) {
  const [input] = data as unknown as [Input];
  const zone = Number(ctx.parameters.zone) || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      <CardHeading
        title="Commits Time Distribution"
        subtitle=" "
        colorScheme="dark"
        style={{ height: 48, flexShrink: 0, padding: '0 24px' }}
      />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px 20px' }}>
        <Heatmap
          data={input}
          zone={zone}
          width={ctx.width}
          height={ctx.height - 48}
          dpr={ctx.dpr}
          runtime={ctx.runtime}
        />
      </div>
    </div>
  );
}

export const type = 'react';

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
  const max = useMemo(
    () => data.reduce((m, d) => Math.max(m, d.pushes), 0),
    [data],
  );

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
        {/* Hour labels (every 3rd hour) */}
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
    </svg>
  );
});
