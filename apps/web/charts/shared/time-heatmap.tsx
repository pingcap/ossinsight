import { useMemo } from 'react';

export type DataPoint = {
  dayofweek: number;
  hour: number;
  pushes: number;
};

export const times = Array(24).fill(0).map((_, i) => i);
export const days = Array(7).fill(0).map((_, i) => i);
export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const COLORS = ['#2C2C2C', '#00480D', '#017420', '#34A352', '#6CDE8C', '#B5FFC9'];
export const COLORS_LIGHT = ['#e8e8e8', '#B5FFC9', '#6CDE8C', '#34A352', '#017420', '#00480D'];

export function getColor(num: number, max: number, colors: string[] = COLORS): string {
  if (num === 0) return colors[0];
  const d = num / max;
  if (d < 1 / 5) return colors[1];
  if (d < 2 / 5) return colors[2];
  if (d < 3 / 5) return colors[3];
  if (d < 4 / 5) return colors[4];
  return colors[5];
}

export const SIZE = 16;
export const GAP = 3;
export const PADDING_LEFT = 28;
export const PADDING_TOP = 24;
export const CHART_WIDTH = SIZE * 24 + GAP * 23 + PADDING_LEFT;
export const CHART_HEIGHT = SIZE * 7 + GAP * 6 + 40;

export function SingleHeatmap({ data, zone }: { data: DataPoint[]; zone: number }) {
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
