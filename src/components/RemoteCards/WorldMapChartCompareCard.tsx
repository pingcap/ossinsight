import * as React from "react";
import {useMemo} from "react";
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
import {alpha2ToGeo, alpha2ToTitle} from "../../lib/areacode";

if (!echarts.getMap('world')) {
  echarts.registerMap('world', map())
}

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

  const loading = useMemo(() => {
    return req1.loading || req2.loading
  }, [req1.loading, req2.loading])

  const error = useMemo(() => {
    return req1.error || req2.error
  }, [req1.error, req2.error])

  const options = useMemo(() => {
    const s = series[0]

    const realSeries = !s ? [] : [data1, data2].map((data, n) => Object.assign({}, s, {
      type: 'scatter',
      geoIndex: 0,
      coordinateSystem: 'geo',
      name: [params1, params2][n].repoName,
      encode: {
        lng: 0,
        lat: 1,
        value: 2,
        tooltip: [3, 2]
      },
      data: data.map((item) => {
        const title = alpha2ToTitle(item[dimensionColumnName])
        const value = item[metricColumnName];
        const {long, lat} = alpha2ToGeo(item[dimensionColumnName])

        return [long, lat, value, title]
      }),
      symbolSize: function (val) {
        return 1 + Math.sqrt(val[2] / max) * 64;
      },
    }))

    const max = Math.max(data1?.[0]?.[metricColumnName] ?? 0, data2?.[0]?.[metricColumnName] ?? 0)

    return {
      geo: {
        roam: false,
        map: 'world',
        silent: true,
        zoom: 1.7,
        top: '35%',
        projection: {
          project: (point) => [point[0] / 180 * Math.PI, -Math.log(Math.tan((Math.PI / 2 + point[1] / 180 * Math.PI) / 2))],
          unproject: (point) => [point[0] * 180 / Math.PI, 2 * 180 / Math.PI * Math.atan(Math.exp(point[1])) - 90]
        }
      },
      tooltip: {
        trigger: 'item',
      },
      legend: {
        show: true
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
  }, [data1, data2, isDarkTheme, isSmall])

  return <CompareCard {...props} loading={loading} error={error} query={queryName} datas={[req1.data, req2.data]}>
    <BrowserOnly>
      {() => (
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
      )}
    </BrowserOnly>
  </CompareCard>
}
