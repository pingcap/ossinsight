import * as React from "react";
import {useCallback, useMemo, useState} from "react";
import {useRemoteData} from "../RemoteCharts/hook";
import ReactECharts from 'echarts-for-react';
import useThemeContext from "@theme/hooks/useThemeContext";
import {BaseChartCardProps} from "./BasicCard";
import * as echarts from "echarts";
import {PieSeriesOption} from "echarts";
import BrowserOnly from "@docusaurus/BrowserOnly";
import CompareCard from "./CompareCard";
import useMediaQuery from '@mui/material/useMediaQuery';
import {useTheme} from '@mui/material/styles';
import map from '@geo-maps/countries-land-10km';
import {ToggleButton, ToggleButtonGroup} from "@mui/material";

const mapData = map()
mapData.features.forEach(feature => {
  feature.properties.name = feature.properties.A3
  delete feature.properties.A3
})
echarts.registerMap('world', mapData)

export interface PieSeriesExtendOption extends PieSeriesOption {
  nameMap?: (name: string) => string;
  titleMap?: (name: string) => string;
}

export interface PieChartCardProps extends Omit<BaseChartCardProps, 'params'> {
  params1: Record<string, unknown>
  params2: Record<string, unknown>
  dimensionColumnName: string,
  metricColumnName: string,
  series: PieSeriesExtendOption[],
}

export default function WorldMapChartCompareCard(props: PieChartCardProps) {
  const {
    queryName,
    params1,
    params2,
    series = [],
    shouldLoad,
    grid,
    dimensionColumnName,
    metricColumnName
  } = props;
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'))
  const req1 = useRemoteData(queryName, params1, true, params1 && shouldLoad);
  const req2 = useRemoteData(queryName, params2, true, params2 && shouldLoad);
  const {isDarkTheme} = useThemeContext();

  const [data1, data2] = useMemo(() => {
    return [
      req1.data?.data.sort((a, b) => Math.sign(b.count - a.count)) ?? [],
      req2.data?.data.sort((a, b) => Math.sign(b.count - a.count)) ?? []]
  }, [req1.data, req2.data])

  const [which, setWhich] = useState(0)

  const onWhichChange = useCallback((e) => {
    setWhich(parseInt(e.target.value))
  }, [setWhich])

  const loading = useMemo(() => {
    return req1.loading || req2.loading
  }, [req1.loading, req2.loading])

  const error = useMemo(() => {
    return req1.error || req2.error
  }, [req1.error, req2.error])

  const options = useMemo(() => {
    const s = series[0]

    const realSeries = !s ? [] : [Object.assign({}, s, {
      type: 'map',
      roam: false,
      map: 'world',
      colorBy: 'series',
      name: [params1, params2][which].repoName,
      nameMap: s.titleMap,
      nameProperty: 'name',
      showLegendSymbol: false,
      data: [data1, data2][which].map((item) => {
        const name = s.nameMap?.(item[dimensionColumnName]) ?? item[dimensionColumnName];
        const title = s.titleMap?.(item[dimensionColumnName]) ?? item[dimensionColumnName]
        const value = item[metricColumnName];

        return {
          value: value,
          name,
          title
        };
      })
    })]

    const max = [data1, data2][which][0]?.[metricColumnName]

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          return `<b>${params.marker} ${series[0].titleMap(params.name) ?? params.name}</b>: ${[params.value] ?? 0}`
        },
      },
      visualMap: {
        left: 'right',
        min: 1,
        max: max,
        inRange: {
          color: [
            '#ffffff',
            '#a50026'
          ]
        },
        text: ['High', 'Low'],
        calculable: true
      },
      series: realSeries,
      grid: Object.assign({
        left: 16,
        top: 16,
        bottom: 16,
        right: 16,
        containLabel: true
      }, grid),
    }
  }, [data1, data2, isDarkTheme, isSmall, which])

  return <CompareCard {...props} loading={loading} error={error} query={queryName} datas={[req1.data, req2.data]}>
    <BrowserOnly>
      {() => (
        <div style={{ textAlign: 'center' }}>
          <ToggleButtonGroup
            size='small'
            color='primary'
            value={String(which)}
            exclusive
            onChange={onWhichChange}
          >
            <ToggleButton value="0">
              {params1.repoName}
            </ToggleButton>
            <ToggleButton value="1">
              {params2.repoName}
            </ToggleButton>
          </ToggleButtonGroup>
          <ReactECharts
            option={options}
            notMerge={true}
            lazyUpdate={true}
            style={{
              width: '100%',
              height: 'auto',
              aspectRatio: '16 / 9',
              overflow: 'hidden'
            }}
            theme={isDarkTheme ? 'dark' : 'vintage'}
            opts={{
              devicePixelRatio: window?.devicePixelRatio ?? 1,
              renderer: 'canvas',
              locale: 'en'
            }}
          />
        </div>
      )}
    </BrowserOnly>
  </CompareCard>
}
