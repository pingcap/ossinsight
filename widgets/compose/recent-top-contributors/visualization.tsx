/** @jsxImportSource @/lib/compose */

import { builtin, Card, JSX, Widget } from '@/lib/compose';
import type { WidgetVisualizerContext } from '@ossinsight/widgets-types';
import { DateTime } from 'luxon';

type Params = {
  repo_id: number;
};

type DataPoint = {
  actor_login: string;
  events: number;
};

type Input = [[DataPoint[]]];

export default function (
  [[contributors]]: Input,
  ctx: WidgetVisualizerContext<Params>,
): JSX.Element {
  // This range is not returned by api https://github.com/pingcap/ossinsight/blob/main/configs/queries/analyze-recent-top-contributors/template.sql
  const today = new Date();
  const prior30 = new Date(new Date().setDate(today.getDate() - 30));
  const end = DateTime.fromISO(today.toISOString());
  const start = DateTime.fromISO(prior30.toISOString());
  const subtitle = `${start.toFormat('MM-dd')} - ${end.toFormat('MM-dd')}`;

  const sortedContributors = contributors.sort((a, b) => b.events - a.events);

  return (
    <Card padding={[0, Card.COMMON_PADDING, Card.COMMON_PADDING - 4]} title="Top Active Contributors" subtitle={`Date: ${subtitle}`}>
      <flex direction="horizontal" ifEmpty="indicator" data={sortedContributors}>
        <flex direction="vertical" grow={0.7}>
          {sortedContributors.map(contributor => (
            <builtin.AvatarLabel label={contributor.actor_login} imgSrc={`https://github.com/${contributor.actor_login}.png`} />
          ))}
        </flex>
        <Widget name={'@ossinsight/widget-analyze-repo-recent-top-contributors'} parameters={ctx.parameters} data={[sortedContributors]} />
      </flex>
    </Card>
  );
}

export const type = 'compose';

export const width = 248 * 1.5;
export const height = 132 * 1.5;
