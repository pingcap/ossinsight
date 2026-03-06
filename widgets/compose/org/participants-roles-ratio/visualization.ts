import type { ComposeVisualizationConfig, WidgetVisualizerContext } from '@ossinsight/widgets-types';
import { computeLayout, horizontal, vertical, widget } from '@/lib/widgets-utils/compose';

type Params = {
  owner_id: string;
  period?: string;
};

// type DataPoint = {
//   issue_closed_ratio: number;
//   pr_merged_ratio: number;
//   pr_reviewed_ratio: number;
// };

type DataPoint = {
  issue_commenters: number;
  issue_creators: number;
  participants: number;
  pr_commenters: number;
  pr_creators: number;
  pr_reviewers: number;
  commit_authors: number;
};

type Input = [DataPoint[]];

const dimensions = [
  {
    key: 'issue_commenters',
    name: 'Issue Commenters',
  },
  {
    key: 'issue_creators',
    name: 'Issue Creators',
  },
  {
    key: 'pr_commenters',
    name: 'Pull Request Commenters',
  },
  {
    key: 'pr_creators',
    name: 'Pull Request Creators',
  },
  {
    key: 'pr_reviewers',
    name: 'Pull Request Reviewers',
  },
  {
    key: 'commit_authors',
    name: 'Commit Authors',
  },
];

const normalize = (data: DataPoint) => {
  return dimensions.map(({ name, key }) => ({
    name,
    value: data[key],
  }));
};

export default function (
  [input]: Input,
  ctx: WidgetVisualizerContext<Params>,
): ComposeVisualizationConfig {
  const WIDTH = ctx.width;
  const HEIGHT = ctx.height;
  const SPACING = 16;
  const PADDING = 24;
  const HEADER_HEIGHT = 48;
  const HORIZONTAL_SPACING = 16;

  const data = input[0];

  const normalizedData = normalize(input[0]);
  const radarDimensions = normalizedData.map(item => ({ name: item.name, max: data.participants }));
  const radarData = { name: '', value: normalizedData.map(i => i.value) };

  return computeLayout(
    vertical(
      widget('builtin:card-heading', undefined, {
        title:
          'Which Roles Dominate Participation in This GitHub Organization?',
        subtitle: ` `,
      }).fix(HEADER_HEIGHT),
      vertical(
        widget('builtin:label', undefined, {
          label:
            'Please note: Individuals within an organization often hold multiple roles',
        }).flex(0.1),
        horizontal(
          widget(
            '@ossinsight/basic-radar-chart',
            radarData,
            { dimensions: radarDimensions },
          ),
        )
          .gap(HORIZONTAL_SPACING)
          .flex(),
      ).gap(HORIZONTAL_SPACING),
    )
      .padding([0, PADDING, PADDING])
      .gap(SPACING),
    0,
    0,
    WIDTH,
    HEIGHT,
  );
}

export const type = 'compose';

export const grid = {
  cols: 5,
  rows: 5,
}
