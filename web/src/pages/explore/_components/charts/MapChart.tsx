import { ChartResult } from '@site/src/api/explorer';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { EChartsOption } from 'echarts';
import EChartsReact from 'echarts-for-react';
import { alpha2ToGeo, alpha2ToTitle } from '@site/src/lib/areacode';
import { worldMapGeo } from '@site/src/dynamic-pages/analyze/charts/options';
import AspectRatio from 'react-aspect-ratio';
import { styled } from '@mui/material';
import { isNonemptyString, isNullish } from '@site/src/utils/value';

function transformData (data: Array<Record<string, any>>, code: string, value: string): Array<[string, number, number, number]> {
  return data.map(item => {
    const title = alpha2ToTitle(item[code]);
    const { long, lat } = alpha2ToGeo(item[code]) ?? {};
    return [
      title,
      long,
      lat,
      item[value],
    ] as [string, number, number, number];
  }).filter(([title]) => isNonemptyString(title)).sort((a, b) => Math.sign(b[3] - a[3]));
}

export default function MapChart ({ chartName, title, country_code: countryCode, value, data }: ChartResult & { data: any[] }) {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const chartRef = useRef<EChartsReact>(null);

  const transformedData = useMemo(() => {
    return transformData(data, countryCode, value);
  }, [data, countryCode, value]);

  const options: EChartsOption = useMemo(() => {
    const max = transformedData[0]?.[3] ?? 0;

    return {
      backgroundColor: 'rgb(36, 35, 43)',
      geo: worldMapGeo(),
      dataset: [{
        id: 'top1',
        source: transformedData.slice(0, 1),
      }, {
        id: 'rest',
        source: transformedData.slice(1),
      }],
      title: {
        text: title,
      },
      legend: {
        show: true,
        left: 8,
        top: 24,
        orient: 'vertical',
      },
      series: [{
        type: 'effectScatter',
        datasetId: 'top1',
        coordinateSystem: 'geo',
        name: `Top 1 (${transformedData[0]?.[0]})`,
        encode: {
          lng: 1,
          lat: 2,
          value: 3,
          itemId: 0,
        },
        symbolSize: (val) => {
          return 1 + Math.sqrt(val[3] / max) * 64;
        },
      }, {
        type: 'scatter',
        datasetId: 'rest',
        coordinateSystem: 'geo',
        name: 'Rest',
        encode: {
          lng: 1,
          lat: 2,
          value: 3,
          itemId: 0,
        },
        symbolSize: (val) => {
          return 1 + Math.sqrt(val[3] / max) * 64;
        },
      }],
      tooltip: {
        formatter: (params) => {
          return `<b>${value as string}</b><br/>${params.marker as string} <b>${params.value[0] as string}</b> ${params.value[3] as string}`;
        },
      },
      animationDuration: 2000,
    };
  }, [chartName, title, value, transformedData]);

  useEffect(() => {
    if (isNullish(ref)) {
      return;
    }
    const so = new ResizeObserver(([entry]) => {
      chartRef.current?.getEchartsInstance()?.resize({
        height: entry.contentRect.height,
      });
    });

    so.observe(ref);

    return () => {
      so.disconnect();
    };
  }, [ref]);

  return (
    <AspectRatio ratio={4 / 3} style={{ maxWidth: 600, margin: 'auto' }}>
      <MapContainer ref={setRef}>
        <EChartsReact
          theme="dark"
          opts={{
            height: ref?.clientHeight ?? 'auto',
          }}
          option={options}
          ref={chartRef}
        />
      </MapContainer>
    </AspectRatio>
  );
}

const MapContainer = styled('div')`
  height: 100%;
`;
