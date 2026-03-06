/** @jsxImportSource @/lib/compose */
import { Card, JSX, Widget } from '@/lib/compose';

import type { WidgetVisualizerContext } from '@ossinsight/widgets-types';
import { DateTime } from 'luxon';

type Params = {
  repo_id: number
}

type DataPoint = {
  events: number;
  event_month: string;
}

export default function (input: DataPoint[], ctx: WidgetVisualizerContext<Params>): JSX.Element {
  const end = DateTime.now().startOf('month');
  const start = end.minus({ year: 2 }).startOf('month');
  const subtitle = `${start.toFormat('yyyy-MM')} - ${end.toFormat('yyyy-MM')}`;

  return (
    <Card title="Repository Activity Trends" subtitle={`Date: ${subtitle}`}>
      <Widget
        name="@ossinsight/widget-analyze-repo-activity-trends"
        ifEmpty="indicator"
        data={input}
        parameters={ctx.parameters}
        padding={[0, 8]}
      />
    </Card>
  );
}

export const type = 'compose';

export const width = 814;
export const height = 216;
