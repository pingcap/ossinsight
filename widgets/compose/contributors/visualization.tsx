/** @jsxImportSource @/lib/compose */

import { JSX, Card, builtin } from '@/lib/compose';
import type { WidgetVisualizerContext } from '@ossinsight/widgets-types';
import { DateTime } from 'luxon';

type Params = {
  repo_id: string;
  limit: number;
};

type DataPoint = {
  actor_login: string;
  events: number;
};

type Input = [DataPoint[]];

const calcGridCfg = (limit: number) => {
  switch (limit) {
    case 50:
    case 100:
      return {
        rows: 5,
        cols: 20,
        size: 20,
      };
    case 200:
      return {
        rows: 8,
        cols: 25,
        size: 15,
      };
    case 5:
    case 10:
    case 30:
    default:
      return {
        rows: 3,
        cols: 10,
        size: 40,
      };
  }
};

export default function (
  [contributors]: Input,
  ctx: WidgetVisualizerContext<Params>,
): JSX.Element {
  const today = new Date();
  const prior30 = new Date(new Date().setDate(today.getDate() - 30));
  const end = DateTime.fromISO(today.toISOString());
  const start = DateTime.fromISO(prior30.toISOString());
  const subtitle = `${start.toFormat('MM-dd')} - ${end.toFormat('MM-dd')}`;

  const limit = ctx.parameters.limit || '30';
  const { rows, cols, size } = calcGridCfg(Number(limit));

  return (
    <Card title="Contributors" subtitle=" ">
      <grid rows={rows} cols={cols} gap={4} data={contributors} ifEmpty="indicator">
        {...contributors.map(item => (
          <builtin.AvatarLabel label="" imgSize={size} imgSrc={item.actor_login ? `https://github.com/${item.actor_login}.png` : ''} />
        ))}
      </grid>
    </Card>
  );
}

export const type = 'compose';

export const width = 436 * 1.5;
export const height = 132 * 1.5;
