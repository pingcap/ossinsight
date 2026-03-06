import type { WidgetVisualizerContext } from '@ossinsight/widgets-types';
import { scaleToFit } from '@/lib/widgets-utils/utils';
import { autoSize } from '@/lib/widgets-utils/compose/size';
import { CSSProperties, ForwardedRef, forwardRef, useMemo } from 'react';

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

type TransformedDataPoint = DataPoint & {
  cnt: number
}

type Input = DataPoint[];

function useFilteredData(input: Input, runtime: 'server' | 'client'): TransformedDataPoint[] {
  if (runtime === 'client') {
    return useMemo(() => {
      return transformData(input);
    }, [input, type]);
  } else {
    return transformData(input);
  }
}

const transformData = (data: DataPoint[]) => {
  return data.map((d) => ({
    ...d,
    cnt: d.pushes,
  }));
};

export default function (input: Input, ctx: WidgetVisualizerContext<Params>) {
  const data = useFilteredData(input, ctx.runtime);
  // const user = ctx.getUser(ctx.parameters.user_id);
  const timezone = Number(ctx.parameters.zone) || 0;

  return (
    <TimeDistribution
      width={ctx.width}
      height={ctx.height}
      dpr={ctx.dpr}
      runtime={ctx.runtime}
      size={18}
      gap={4}
      data={data}
      offset={timezone}
      title={`@${ctx.parameters.owner_id}'s Contribution time distribution (UTC +0)`}
      colorScheme={ctx.theme.colorScheme}
    />
  );
}

export const type = 'react-svg';

export const grid = {
  cols: 6,
  rows: 3,
}

interface TimeDistributionProps {
  title: string;
  size: number;
  gap: number;
  offset: number;
  data: Array<TransformedDataPoint>;
  className?: string;
  style?: CSSProperties;
  width: number;
  height: number;
  dpr: number;
  runtime: 'client' | 'server';
  colorScheme: string;
}

const times = Array(24)
  .fill(0)
  .map((_, i) => i);
const days = Array(7)
  .fill(0)
  .map((_, i) => i);

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// const TIME_NAMES = ['0a', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12p', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
const TIME_NAMES = Array(24)
  .fill(0)
  .map((_, i) => i);

const TimeDistribution = forwardRef(
  (
    {
      runtime,
      dpr,
      width: tw,
      height: th,
      title,
      size,
      gap,
      offset,
      data,
      className,
      style,
      colorScheme,
    }: TimeDistributionProps,
    ref: ForwardedRef<SVGSVGElement>
  ) => {
    const max = useMemo(() => {
      return data.reduce((max, cur) => Math.max(max, cur.cnt), 0);
    }, [data]);

    const paddingTop = 36;
    const paddingLeft = 28;
    const width = size * 24 + gap * 23 + paddingLeft;
    const height = size * 7 + gap * 6 + 40;

    const { width: realWidth, height: realHeight } = scaleToFit(
      width,
      height + paddingTop,
      autoSize({ runtime, dpr }, tw),
      autoSize({ runtime, dpr }, th)
    );

    const colors =
      colorScheme === 'light'
        ? contributeDistributionColorsLight
        : contributeDistributionColors;

    return (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width={realWidth}
        height={realHeight}
        viewBox={`${-paddingLeft - 16} -${paddingTop + 16} ${
          width + paddingLeft + 16
        } ${height + paddingTop + 16}`}
        display='block'
        className={className}
        style={{ ...style, backgroundColor: 'transparent' }}
        ref={ref}
      >
        <g id='chart'>
          {times.map((time) =>
            days.map((day) => (
              <rect
                key={`${time}-${day}`}
                x={time * (size + gap)}
                y={day * (size + gap)}
                width={size}
                height={size}
                rx={3}
                ry={3}
                fill={getColor(0, 0, colors)}
              />
            ))
          )}
          {data.map(({ dayofweek: day, cnt, hour: time }) => (
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
        <g id='labels'>
          {DAY_NAMES.map((name, day) => (
            <text
              key={name}
              y={day * (size + gap) + size - 6}
              x={-4}
              textAnchor='end'
              fontSize={12}
              fill='#aaa'
              fontFamily='monospace'
            >
              {name}
            </text>
          ))}
          {TIME_NAMES.map((name, time) => (
            <text
              key={name}
              y={-6}
              x={((24 + time) % 24) * (size + gap) + size / 2}
              textAnchor='middle'
              fontSize={12}
              fill='#aaa'
              fontFamily='monospace'
            >
              {name}
            </text>
          ))}
        </g>
        <g id='legend'>
          <text
            fontSize={12}
            fill='#dadada'
            x='0'
            y={height - 29}
            alignmentBaseline='text-before-edge'
          >
            less
          </text>
          {colors.map((color, i) => (
            <rect
              key={color}
              fill={color}
              x={36 + i * (size + 4)}
              y={height - 28}
              width={size}
              height={size}
              rx={3}
              ry={3}
            />
          ))}
          <text
            fontSize={12}
            fill='#dadada'
            x={48 + contributeDistributionColors.length * (size + 4)}
            y={height - 28}
            alignmentBaseline='text-before-edge'
          >
            more
          </text>
        </g>
      </svg>
    );
  }
);

const contributeDistributionColors = [
  '#2C2C2C',
  '#00480D',
  '#017420',
  '#34A352',
  '#6CDE8C',
  '#B5FFC9',
];
const contributeDistributionColorsLight = [
  '#e8e8e8',
  '#B5FFC9',
  '#6CDE8C',
  '#34A352',
  '#017420',
  '#00480D',
];

const getColor = (num: number, max: number, colors: string[]) => {
  const d = num / max;
  if (num === 0) {
    return colors[0];
  } else if (d < 1 / 5) {
    return colors[1];
  } else if (d < 2 / 5) {
    return colors[2];
  } else if (d < 3 / 5) {
    return colors[3];
  } else if (d < 4 / 5) {
    return colors[4];
  } else {
    return colors[5];
  }
};
