type RecentStatsPoint = {
  idx: number;
  current_period_day: string;
};

export function detailedRecentStatsAxes(data: RecentStatsPoint[]) {
  return {
    xAxis: {
      type: 'category' as const,
      inverse: true,
      data: data.map((point) => point.current_period_day),
      axisLine: {
        show: true,
        lineStyle: { color: '#454548' },
      },
      axisTick: { show: false },
      axisLabel: {
        show: false,
        color: '#8f8f96',
        fontSize: 10,
        interval: 6,
        margin: 8,
        formatter: (value: string) => value.slice(5).replace('-', '/'),
      },
      splitLine: {
        show: true,
        lineStyle: { color: '#2a2a2c', type: 'solid' as const },
      },
    },
    yAxis: {
      type: 'value' as const,
      show: true,
      min: 0,
      minInterval: 1,
      splitNumber: 3,
      name: 'Daily',
      nameGap: 8,
      nameTextStyle: { color: '#8f8f96', fontSize: 10 },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#8f8f96',
        fontSize: 10,
        formatter: (value: number) => Number.isInteger(value) ? String(value) : '',
      },
      splitLine: {
        show: true,
        lineStyle: { color: '#2a2a2c', type: 'dashed' as const },
      },
    },
    grid: {
      left: 8,
      top: 20,
      right: 8,
      bottom: 4,
      containLabel: true,
    },
  };
}

export function detailedRecentStatsTooltip(options: {
  currentValueField: string;
  previousValueField: string;
  unit: string;
  currentColor: string;
  previousColor: string;
}) {
  return {
    show: true,
    trigger: 'axis' as const,
    confine: true,
    position: (pos: number[], _params: unknown, _dom: HTMLElement, _rect: unknown, size: { viewSize: number[] }) => {
      const position: Record<string, number> = { top: 4 };
      position[pos[0] < size.viewSize[0] / 2 ? 'right' : 'left'] = 5;
      return position;
    },
    formatter: (params: any[]) => {
      const [current, previous] = params;
      return `<div>
        <div style="color: #fff;">
          <div style="font-size: 12px;"><span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${options.currentColor}; margin-right: 5px;"></span>${current?.data?.current_period_day ?? '—'}</div>
          <div style="font-size: 14px;">${current?.data?.[options.currentValueField] ?? 0} ${options.unit}</div>
        </div>
        <hr style="margin: 4px 0; border-color: #3a3a3c;" />
        <div style="color: #8a8a8a;">
          <div style="font-size: 12px;"><span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${options.previousColor}; margin-right: 5px;"></span>${previous?.data?.last_period_day ?? '—'}</div>
          <div style="font-size: 14px;">${previous?.data?.[options.previousValueField] ?? 0} ${options.unit}</div>
        </div>
      </div>`;
    },
    axisPointer: { type: 'line' as const },
  };
}
