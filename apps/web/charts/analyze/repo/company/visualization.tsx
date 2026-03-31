import type { WidgetVisualizerContext } from '@/lib/charts-types';
import { renderWordCloud } from '@/charts/shared/word-cloud';

type Params = {
  repo_id: string;
  vs_repo_id?: string;
  activity: string;
};

type DataPoint = {
  company_name: string;
  proportion: number;
  stargazers: number;
};

type Input = [DataPoint[], DataPoint[] | undefined];

const companyValueIndices: Record<string, string> = {
  'analyze-stars-company': 'stargazers',
  'analyze-issue-creators-company': 'issue_creators',
  'analyze-pull-request-creators-company': 'code_contributors',
};

export default async function (
  input: Input,
  ctx: WidgetVisualizerContext<Params>,
  signal?: AbortSignal,
) {
  return renderWordCloud(input, ctx, {
    getText: (item: DataPoint) => item.company_name,
    getValueIndex: (ctx) => {
      const companyType = `analyze-${ctx.parameters.activity || 'stars'}-company`;
      return companyValueIndices[companyType];
    },
    getColor: (i, ctx) => ctx.theme.echartsColorPalette[i],
    sortComparator: (a, b) => a.size - b.size,
  }, signal);
}

export const type = 'react-svg';
export const asyncComponent = true;
