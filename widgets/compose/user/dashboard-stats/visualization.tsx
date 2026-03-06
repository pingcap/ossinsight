/** @jsxImportSource @/lib/compose */

import { builtin, Card, JSX, Widget } from '@/lib/compose';
import type { WidgetVisualizerContext } from '@ossinsight/widgets-types';

type Params = {
  user_id: string;
};

type ContributionType =
  | 'issues'
  | 'issue_comments'
  | 'pull_requests'
  | 'reviews'
  | 'review_comments'
  | 'pushes';

export const contributionTypes: ContributionType[] = [
  'issues',
  'pull_requests',
  'reviews',
  'pushes',
  'review_comments',
  'issue_comments',
];

type DataPoint = {
  contribution_type: ContributionType;
  event_month: string;
  cnt: number;
};

type PersonalOverviewDataPoint = {
  code_additions: number;
  code_deletions: number;
  code_reviews: number;
  contribute_repos: number;
  issues: number;
  pull_requests: number;
  repos: number;
  star_earned: number;
  star_repos: number;
  user_id: number;
};

type PersonalLanguagesDataPoint = {
  language: string;
  prs: number;
  percentage: number;
};

type Input = [
  DataPoint[],
  PersonalOverviewDataPoint[],
  PersonalLanguagesDataPoint[]
];

const languangeColors = [
  '#f1e05a',
  '#2b7489',
  '#3572A5',
  '#e34c26',
  '#563d7c',
  '#b07219',
  '#4F5D95',
  '#f1e05a',
  '#178600',
  '#0052cc',
  '#701516',
  '#c22d40',
  '#f1e05a',
  '#e34c26',
  '#b07219',
  '#563d7c',
  '#4F5D95',
  '#178600',
  '#0052cc',
  '#701516',
  '#c22d40',
];

const handleLangs = (langs: PersonalLanguagesDataPoint[], maxLangs = 7) => {
  const sortedLangs = langs.sort((a, b) => b.percentage - a.percentage);
  if (sortedLangs.length <= maxLangs) return sortedLangs;
  const top7Langs = sortedLangs.slice(0, maxLangs);
  const otherLangs = sortedLangs.slice(maxLangs);
  const otherLangsPercent = otherLangs.reduce(
    (acc, cur) => acc + cur.percentage,
    0
  );
  return [
    ...top7Langs,
    { language: 'Others', percentage: otherLangsPercent, prs: 0 },
  ];
};

const handleOverview = (overview: PersonalOverviewDataPoint) => {
  const {
    star_repos,
    star_earned,
    contribute_repos,
    repos,
    pull_requests,
    issues,
    code_reviews,
    code_additions,
    code_deletions,
  } = overview;
  return [
    {
      icon: 'gh-star',
      label: 'Starred Repos',
      type: 'avatar-label',
    },
    {
      type: 'text',
      label: `${star_repos}`,
    },
    ,
    {
      icon: 'gh-star',
      label: 'Stars Earned',
      type: 'avatar-label',
    },
    {
      type: 'text',
      label: `${star_earned}`,
    },
    ,
    {
      icon: 'gh-repo',
      label: 'Contributed to',
      type: 'avatar-label',
    },
    {
      type: 'text',
      label: `${contribute_repos}`,
    },
    ,
    {
      icon: 'gh-pr',
      label: 'Pull Requests',
      type: 'avatar-label',
    },
    {
      type: 'text',
      label: `${pull_requests}`,
    },
    ,
    {
      icon: 'gh-pr',
      label: 'PR Code Changes',
      type: 'avatar-label',
    },
    {
      type: 'label-value',
      label: `+${code_additions}`,
      value: `-${code_deletions}`,
    },
    ,
    {
      icon: 'gh-issue',
      label: 'Issues',
      type: 'avatar-label',
    },
    {
      type: 'text',
      label: `${issues}`,
    },
    ,
    {
      icon: 'gh-code-review',
      label: 'Code Reviews',
      type: 'avatar-label',
    },
    {
      type: 'text',
      label: `${code_reviews}`,
    },
  ];
};

export default function (
  input: Input,
  ctx: WidgetVisualizerContext<Params>
): JSX.Element {
  const overview = input[1][0];
  const langs = input[2];
  const handledLangs = handleLangs(langs);
  const handledOverview = handleOverview(overview);
  const { user_id } = ctx.parameters;
  const user = ctx.getUser(Number(user_id));

  return (
    <Card title={`${user?.login || user_id}'s GitHub Dashboard`} subtitle=' '>
      <grid rows={1} cols={2} gap={4} data={handledOverview} ifEmpty='indicator'>
        <flex direction='vertical' gap={4}>
          <grid
            grow={0.7}
            rows={7}
            cols={2}
            gap={4}
            data={handledOverview}
            ifEmpty='indicator'
          >
            {...handledOverview.map((item) => {
              if (item.type === 'text') {
                return <builtin.Label label={item.label} />;
              }
              if (item.type === 'label-value') {
                if (ctx.runtime === 'server') {
                  return (
                    <flex direction='horizontal'>
                      <builtin.Label labelColor='#6CA963' label={item.label} />
                      <builtin.Label label={`/`} grow={0.3} />
                      <builtin.Label labelColor='#D45D52' label={item.value} />
                    </flex>
                  );
                }
                return (
                  <builtin.LabelValue
                    column={false}
                    label={item.label}
                    value={item.value}
                    labelProps={{
                      style: {
                        color: 'green',
                        lineHeight: 1,
                      },
                    }}
                    valueProps={{
                      style: { color: 'red', fontSize: 12 },
                    }}
                    spliter='/'
                    center
                  />
                );
              }
              return (
                <builtin.AvatarLabel
                  label={item.label}
                  imgSize={20}
                  imgSrc={item.icon}
                />
              );
            })}
          </grid>
          <flex direction='vertical' grow={0.3}>
            <builtin.ProgressBar
              items={handledLangs.map((lang, idx) => ({
                label: lang.language,
                percentage: lang.percentage,
                color: languangeColors[idx],
              }))}
            />
            <flex direction='vertical' gap={2}>
              {handledLangs
                .reduce((acc, cur, idx) => {
                  if (idx % 4 === 0) {
                    acc.push([]);
                  }
                  acc[acc.length - 1].push(cur);
                  return acc;
                }, [] as (typeof handledLangs)[])
                .map((langs, idx1) => (
                  <flex direction='horizontal' gap={2}>
                    {langs.map((lang, idx2) => (
                      <builtin.AvatarLabel
                        label={lang.language}
                        imgSrc='filled-circle'
                        imgProps={{
                          style: {
                            fill: languangeColors[idx1 * 4 + idx2],
                            height: 12,
                            width: 12,
                          },
                        }}
                      />
                    ))}
                    {langs.length < 4 &&
                      new Array(4 - langs.length)
                        .fill(0)
                        .map(() => (
                          <builtin.AvatarLabel label={''} imgSrc='' />
                        ))}
                  </flex>
                ))}
            </flex>
          </flex>
        </flex>
        <flex direction='vertical' gap={4}>
          {/* <builtin-label label={'chart'} /> */}
          <widget
            widget='@ossinsight/widget-analyze-user-contribution-trends'
            ifEmpty='indicator'
            data={[input[0]]}
            parameters={ctx.parameters}
            padding={[0, 8]}
          />
        </flex>
      </grid>
    </Card>
  );
}

export const type = 'compose';

export const width = 770;
export const height = 366;
