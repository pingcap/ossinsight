/** @jsxImportSource @/lib/compose */

import { Card, JSX, Widget } from '@/lib/compose';
import type { WidgetVisualizerContext } from '@ossinsight/widgets-types';
import { DateTime } from 'luxon';

type Params = {
  user_id: number
  activity_type: string
}

type DataPoint = {
  cnt: number
  event_period: string
  repo_id: number
  repo_name: string
}

export default function (input: DataPoint[], ctx: WidgetVisualizerContext<Params>): JSX.Element {
  const end = DateTime.now().startOf('day');
  const start = end.minus({ day: 27 }).startOf('day');
  const subtitle = `${start.toFormat('MM-dd')} - ${end.toFormat('MM-dd')}`;

  const maxRepos = 5;

  const data = computeData(input, maxRepos);

  return (
    <Card title="Last 28 Days Stats" subtitle={`Date: ${subtitle}`}>
      <Widget
        name="@ossinsight/basic-bubbles-chart"
        data={data}
        ifEmpty="No public activities in the recent period."
        parameters={{
          start,
          end,
          axis_field: 'event_period',
          value_field: 'cnt',
          label_field: 'repo_name',
        }}
      />
    </Card>
  );
}

export const type = 'compose';

export const width = 331 * 1.5;
export const height = 159 * 1.5;

function normalizeData (input: DataPoint[], names: string[]): any[] {
  const namesSet = new Map<string, number>(names.map((k, i) => [k, i]));

  return input
    .filter(dp => {
      return namesSet.has(dp.repo_name);
    })
    .sort((a, b) => {
      return namesSet!.get(b.repo_name) - namesSet!.get(a.repo_name);
    });
}

function computeData (input: DataPoint[], maxRepos: number) {
  const names: string[] = [];
  const reposSorted = input.sort((a, b) => {
    const diff = DateTime.fromSQL(b.event_period).toSeconds() - DateTime.fromSQL(a.event_period).toSeconds();
    if (diff) {
      return diff;
    }
    return b.cnt - a.cnt;
  });
  for (let dp of reposSorted) {
    if (names.includes(dp.repo_name)) {
      continue;
    }
    names.push(dp.repo_name);
    if (names.length >= maxRepos) {
      break;
    }
  }
  return normalizeData(reposSorted, names);
}
