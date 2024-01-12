import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { InputLabel, Select, useTheme, useMediaQuery, Box, FormControl, MenuItem } from '@mui/material';
import ECharts from '../ECharts';
import { KeyOfType } from '../../dynamic-pages/analyze/charts/options/utils/data';

const zones: number[] = [
];

for (let i = -12; i <= 13; i++) {
  zones.push(i);
}

const hours = [
  '0h', '1h', '2h', '3h', '4h', '5h', '6h',
  '7h', '8h', '9h', '10h', '11h',
  '12h', '13h', '14h', '15h', '16h', '17h',
  '18h', '19h', '20h', '21h', '22h', '23h',
];

const days = [
  'Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat',
];

export interface HeatMapChartProps<T> {
  loading: boolean;
  data: T[];
  xAxisColumnName: KeyOfType<T, number>;
  yAxisColumnName: KeyOfType<T, number>;
  valueColumnName: KeyOfType<T, number>;
  deps: any[];
}

export default function HeatMapChart<T> ({
  loading,
  data: rawData,
  xAxisColumnName,
  yAxisColumnName,
  valueColumnName,
  deps,
}: HeatMapChartProps<T>) {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [zone, setZone] = useState(0);

  const onZoneChange = useCallback((e) => {
    setZone(e.target.value);
  }, [setZone]);

  const { data, min, max } = useMemo(() => {
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;
    const arr = rawData.map((item) => {
      const value = Number(item[valueColumnName]);
      if (value > max) {
        max = value;
      }
      if (value < min) {
        min = value;
      }
      return [(item[xAxisColumnName] as number + zone + 24) % 24, item[yAxisColumnName], value];
    });
    return {
      data: arr,
      min,
      max,
    };
  }, [rawData, zone, isSmall]);

  const options = useMemo(() => {
    return {
      tooltip: {
        show: true,
      },
      grid: isSmall
        ? {
            top: '0',
            bottom: '0',
            left: '0',
            right: '0',
            containLabel: true,
          }
        : {
            top: '0',
            bottom: '16%',
            left: '0',
            right: '0',
            containLabel: true,
          },
      xAxis: {
        type: 'category',
        data: hours,
        splitArea: {
          show: true,
        },
        nameLocation: 'middle',
        nameGap: 50,
        nameTextStyle: {
          fontSize: 13,
          fontWeight: 'bold',
          color: '#959aa9',
        },
        axisLabel: {
          color: '#959aa9',
          fontWeight: 'bold',
        },
        inverse: false,
      },
      yAxis: {
        type: 'category',
        data: days,
        splitArea: {
          show: true,
        },
        nameLocation: 'middle',
        nameGap: 50,
        nameTextStyle: {
          fontSize: 13,
          fontWeight: 'bold',
          color: '#959aa9',
        },
        axisLabel: {
          color: '#959aa9',
          fontWeight: 'bold',
          rotate: isSmall ? 0 : 0,
          fontSize: isSmall ? 8 : undefined,
        },
        position: 'top',
      },
      visualMap: {
        show: !isSmall,
        min,
        max,
        orient: isSmall ? undefined : 'horizontal',
        left: 'center',
        bottom: 0,
      },
      series: {
        type: 'heatmap',
        data,
        label: {
          show: false,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    };
  }, [data, isSmall, ...deps]);

  return (
    <BrowserOnly>
      {() => (
        <Box>
          <Box sx={{ minWidth: 120, mb: 1 }}>
            <FormControl size='small'>
              <InputLabel id="zone-select-label">Timezone (UTC)</InputLabel>
              <Select
                labelId="zone-select-label"
                id="zone-select"
                value={zone}
                label="Timezone (UTC)"
                onChange={onZoneChange}
                sx={{ minWidth: 120 }}
                variant='standard'
              >
                {zones.map((zone) => (
                  <MenuItem key={zone} value={zone}>
                    {zone > 0 ? `+${zone}` : zone}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <ECharts
            aspectRatio={24 / 10}
            showLoading={loading}
            option={options}
            notMerge={false}
            lazyUpdate={true}
          />
        </Box>
      )}
    </BrowserOnly>
  );
}
