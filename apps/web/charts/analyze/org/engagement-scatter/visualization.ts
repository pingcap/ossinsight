import type {
  EChartsVisualizationConfig,
  WidgetVisualizerContext,
} from '@/lib/charts-types';
import { axisTooltip, simpleGrid } from '@/lib/charts-utils/options';

type Params = {
  owner_id: string;
  hideData?: boolean;
};

type DataPoint = {
  repos: number;
  engagements: number;
  participants: number;
  participant_logins: string;
};

type Input = [DataPoint[], DataPoint[] | undefined];

const calcMinMax = (data: DataPoint[]) => {
  let repoMin = Infinity;
  let repoMax = -Infinity;
  let engagementsMin = Infinity;
  let engagementsMax = -Infinity;
  for (const d of data) {
    if (d.repos < repoMin) {
      repoMin = d.repos;
    }
    if (d.repos > repoMax) {
      repoMax = d.repos;
    }
    if (d.engagements < engagementsMin) {
      engagementsMin = d.engagements;
    }
    if (d.engagements > engagementsMax) {
      engagementsMax = d.engagements;
    }
  }
  return [repoMin, repoMax, engagementsMin, engagementsMax];
};

const getMostEnaged = (data: DataPoint[]) => {
  const limit = 5;
  const getMostEnagedwithLimit = (data: DataPoint[], limit: number) => {
    const sorted = data.sort((a, b) => b.engagements - a.engagements);
    return sorted.slice(0, limit);
  };
  const getMostRepoedwithLimit = (data: DataPoint[], limit: number) => {
    const sorted = data.sort((a, b) => b.repos - a.repos);
    return sorted.slice(0, limit);
  };
  const mostEnaged = getMostEnagedwithLimit(data, limit);
  const mostRepoed = getMostRepoedwithLimit(data, limit);
  const mergedUnique = [...new Set([...mostEnaged, ...mostRepoed])];

  return mergedUnique;
};

export default function (
  input: Input,
  ctx: WidgetVisualizerContext<Params>
): EChartsVisualizationConfig {
  const main = ctx.parameters.owner_id;
  const vs = ctx.parameters.owner_id;
  const hideData = !!ctx.parameters.hideData;

  const [data] = input;

  const filteredData = getMostEnaged(data);

  const [repoMin, repoMax, engagementsMin, engagementsMax] =
    calcMinMax(filteredData);

  return {
    dataset: [
      {
        id: 'main',
        source: hideData ? [] : filteredData,
      },
    ],
    xAxis: {
      name: 'engagements',
      splitLine: { show: true, lineStyle: { color: '#2a2a2c', type: 'dashed' } },
      max: engagementsMax,
    },
    yAxis: {
      name: 'repos',
      splitLine: { show: true, lineStyle: { color: '#2a2a2c', type: 'dashed' } },
      max: repoMax,
    },
    grid: {
      left: 8,
      top: 40,
      right: 90,
      bottom: 8,
      containLabel: true,
    },
    series: {
      type: 'scatter',
      encode: {
        x: 'engagements',
        y: 'repos',
      },
      symbolSize: 30,
      itemStyle: {
        color: '#4E9FFF',
      },
      id: 'main',
      symbol: (value, params) => {
        return `image://https://github.com/${
          value?.participant_logins?.split(',')[0]
        }.png`;
      },
      label: {
        show: true,
        position: 'top',
        formatter: (params) => {
          const labelData = params?.data as any;
          const firstLogin = labelData?.participant_logins?.split(',')[0];
          return `{a|${firstLogin}} ${
            labelData?.participant_logins?.split(',')?.length > 1
              ? `{x|+${labelData?.participant_logins?.split(',')?.length - 1}}`
              : ''
          }`;
        },
        rich: {
          a: {
            lineHeight: 10,
          },
          x: {
            backgroundColor: '#AAAAAA',
            color: '#000',
            padding: 2,
            fontSize: 8,
            borderRadius: 4,
          },
        },
      },
    },
    tooltip: {
      show: true,
      formatter: (params) => {
        const { data } = params;
        return `<div class="text-white">${generateHtmlFromLogins(data?.participant_logins)}
        <p><hr style="margin-bottom:.5rem;margin-top:.5rem"/></p>
        <p>Involved in: <b>${data?.repos} repos</b></p>
        <p>Contribution count: <b>${data?.engagements}</b></p></div>`;
      },
    },
    legend: {
      show: true,
      top: '6%',
    },
  };
}

function generateHtmlFromLogins(loginStr: string, max = 4) {
  const logins = loginStr.split(',');
  const innerHtml = logins
    .slice(0, max)
    .map(
      (login) =>
        `<li style="display:inline-flex;gap:4px;"><img alt="${login}" src="https://github.com/${login}.png" style="width:1rem;height:1rem;" /><span>${login}</span></li>`
    )
    .join('');
  // const moreHtml = logins.length > max ? `<p>+${logins.length - max}</p>` : '';
  const moreHtml = '<p style="color:#7c7c7c;">more...</p>';
  return (
    `<ul style="display:flex;gap:0.25rem;flex-direction:column;">${innerHtml}</ul>` +
    (logins.length > max ? moreHtml : '')
  );
}

export const eventHandlers = [
  {
    type: 'click',
    option: 'series.scatter',
    handler: (params) => {
      const participantLogins = params?.value?.participant_logins;
      if (participantLogins) {
        const firstLogin = participantLogins.split(',')[0];
        window?.open(`/analyze/${firstLogin}`);
      }
    },
  },
];

export const type = 'echarts';
