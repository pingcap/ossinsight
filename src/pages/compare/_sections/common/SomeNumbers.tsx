import React, {useMemo} from "react";
import {Repo} from "../../../../components/CompareHeader/RepoSelector";
import useSWR, {SWRResponse} from "swr";
import {createHttpClient} from "../../../../lib/request";
import * as echarts from 'echarts/core';
import {RadarChart} from 'echarts/charts';
import {LegendComponent, TitleComponent} from 'echarts/components';
import {CanvasRenderer} from 'echarts/renderers';
import {EChartsOption} from "echarts";
import BrowserOnly from "@docusaurus/BrowserOnly";
import {useTheme} from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import {formatNumber} from "../../../../lib/text";
import CompareNumbers, {CompareNumbersContainer} from "../../../../components/RemoteCards/CompareNumbers";
import ECharts from "../../../../components/ECharts";

echarts.use([TitleComponent, LegendComponent, RadarChart, CanvasRenderer]);

export interface SomeNumbersProps {
  repos: [Repo | null, Repo | null]
  queries: { title: string, query: string }[]
}

const httpClient = createHttpClient();

const SomeNumbersPC = ({repos, queries}: SomeNumbersProps) => {
  const r1 = useNumberQueries(queries.map(query => query.query), repos[0])
  const r2 = useNumberQueries(queries.map(query => query.query), repos[1])

  const option: EChartsOption = useMemo(() => {
    return {
      legend: {
        left: '25%',
        orient: 'vertical',
        data: [repos[0]?.name ?? 'repo 1', repos[1]?.name ?? 'repo 2']
      },
      radar: {
        // shape: 'circle',
        indicator: queries.map(({title}, i) => ({
          name: title,
          max: Math.max(r1.data?.[i] ?? 0, r2.data?.[i] ?? 0, 1)
        })),
        axisName: {
          padding: [8, 8]
        },
        center: ['50%', '50%'],
      },
      tooltip: {
        trigger: 'axis'
      },
      series: [
        {
          type: 'radar',
          tooltip: {
            trigger: 'item'
          },
          areaStyle: {},
          data: repos.map((repo, i) => ({
            value: [r1, r2][i].data,
            name: repo?.name ?? `repo ${i + 1}`,
            label: {
              show: true,
              formatter: function (params) {
                return formatNumber(params.value, 1);
              },
            }
          }))
        }
      ]
    };
  }, [r1.data, r2.data])

  return (
    <ECharts
      aspectRatio={4}
      option={option}
      notMerge={false}
      lazyUpdate={true}
    />
  )
}

const SomeNumbersMobile = ({ repos, queries}: SomeNumbersProps) => {
  return (
    <CompareNumbersContainer>
      {queries.map(({title, query}) => (
        <CompareNumbers key={query} title={title} query={query} repos={repos} />
      ))}
    </CompareNumbersContainer>
  )
}

const SomeNumbers = ({ repos, queries}: SomeNumbersProps) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'))

  if (isSmall) {
    return <SomeNumbersMobile repos={repos} queries={queries} />
  } else {
    return <SomeNumbersPC repos={repos} queries={queries} />
  }
}

function useNumberQueries(queries: string[], repo: Repo | null): SWRResponse<number[]> {
  return useSWR([queries, repo], {
    fetcher: (queries, repo) => {
      if (!repo) {
        return Promise.resolve(queries.map(() => 0))
      } else {
        return Promise.all(queries.map(async query => {
          try {
            const {data: {data}} = await httpClient.get(`/q/${query}`, {params: {repoId: repo.id}})
            const origin = Object.values(data[0])[0] as string
            return parseInt(origin)
          } catch (e) {
            return 0
          }
        }))
      }
    },
    fallbackData: queries.map(() => 0) as number[],
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })
}

export default SomeNumbers