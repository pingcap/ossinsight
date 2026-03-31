import type { WidgetVisualizerContext } from '@/lib/charts-types';

import { scaleToFit } from '@/lib/charts-utils/utils';
import { COLORS, COLORS_LIGHT, getColor } from '@/charts/shared/time-heatmap';
import { CSSProperties, ForwardedRef, forwardRef, useMemo } from 'react';

type Params = {
  user_id: number
}

type DataPoint = {
  cnt: number
  dayofweek: number
  hour: number
  type: string
}

type Input = DataPoint[]

function useFilteredData (input: Input, type: string, runtime: 'server' | 'client'): Input {
  if (runtime === 'client') {
    return useMemo(() => {
      return input.filter(i => i.type === type);
    }, [input, type]);
  } else {
    return input.filter(i => i.type === type);
  }
}

export default function (input: Input, ctx: WidgetVisualizerContext<Params>) {
  const data = useFilteredData(input, 'all', ctx.runtime);
  const user = ctx.getUser(ctx.parameters.user_id);

  return (
    <TimeDistribution width={ctx.width} height={ctx.height} dpr={ctx.dpr} runtime={ctx.runtime} size={18} gap={4} data={data} offset={0} title={`@${user?.login}'s Contribution time distribution (UTC +0)`} colorScheme={ctx.theme.colorScheme} />
  );
}

export const type = 'react-svg';

interface TimeDistributionProps {
  title: string;
  size: number;
  gap: number;
  offset: number;
  data: Array<DataPoint>;
  className?: string;
  style?: CSSProperties;
  width: number;
  height: number;
  dpr: number;
  runtime: 'client' | 'server';
  colorScheme: string;
}

const times = Array(24).fill(0).map((_, i) => i);
const days = Array(7).fill(0).map((_, i) => i);

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// const TIME_NAMES = ['0a', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12p', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
const TIME_NAMES = Array(24).fill(0).map((_, i) => i);

const TimeDistribution = forwardRef(({ runtime, dpr, width: tw, height: th, title, size, gap, offset, data, className, style, colorScheme }: TimeDistributionProps, ref: ForwardedRef<SVGSVGElement>) => {
  const max = useMemo(() => {
    return data.reduce((max, cur) => Math.max(max, cur.cnt), 0);
  }, [data]);

  const paddingTop = 8;
  const paddingLeft = 28;
  const width = size * 24 + gap * 23 + paddingLeft;
  const height = size * 7 + gap * 6 + 40;

  const { width: realWidth, height: realHeight } = scaleToFit(width, height + paddingTop, tw, th);

  const colors = colorScheme === 'light' ? COLORS_LIGHT : COLORS;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={realWidth} height={realHeight}
         viewBox={`${-paddingLeft - 16} -${paddingTop + 16} ${width + paddingLeft + 16} ${height + paddingTop + 16}`} display="block"
         className={className}
         style={{ ...style, backgroundColor: 'transparent' }}
         ref={ref}
    >
      <g id="chart">
        {times.map(time => days.map(day =>
          <rect
            key={`${time}-${day}`}
            x={time * (size + gap)}
            y={day * (size + gap)}
            width={size}
            height={size}
            rx={3}
            ry={3}
            fill={getColor(0, 0, colors)}
          />,
        ))}
        {data.map(({ dayofweek: day, cnt, hour: time, type }) => (
          <rect
            key={`${time}-${day}`}
            x={((24 + time + offset) % 24) * (size + gap)}
            y={day * (size + gap)}
            width={size}
            height={size}
            rx={3}
            ry={3}
            fill={getColor(cnt, max, colors)}
          />
        ))}
      </g>
      <g id="labels">
        {DAY_NAMES.map((name, day) => (
          <text
            key={name}
            y={day * (size + gap) + size - 6}
            x={-4}
            textAnchor="end"
            fontSize={12}
            fill="#aaa"
            fontFamily="Menlo"
          >
            {name}
          </text>
        ))}
        {TIME_NAMES.map((name, time) => (
          <text
            key={name}
            y={-6}
            x={((24 + time) % 24) * (size + gap) + size / 2}
            textAnchor="middle"
            fontSize={12}
            fill="#aaa"
            fontFamily="Menlo"
          >
            {name}
          </text>
        ))}
      </g>
      <g id="legend">
        <text fontSize={12} fill="#777" x={-26} y={height - 16}>less</text>
        {colors.map((color, i) => (
          <rect
            key={color}
            fill={color}
            x={i * (size + 4)}
            y={height - 28}
            width={size}
            height={size}
            rx={3}
            ry={3}
          />
        ))}
        <text fontSize={12} fill="#777" x={COLORS.length * (size + 4)} y={height - 16}>more</text>
      </g>
    </svg>
  );
});

export const width = 720;
export const height = 310;