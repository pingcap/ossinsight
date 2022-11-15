import { registerTheme } from 'echarts/core';

export function registerThemeDark (bg = true) {
  const contrastColor = '#E9EAEE';
  const boxColor = '#2c2c2c';
  const borderColor = '#3c3c3c';
  const axisCommon = function () {
    return {
      axisLine: {
        lineStyle: {
          color: borderColor,
        },
      },
      axisTick: {
        lineStyle: {
          color: borderColor,
        },
      },
      axisLabel: {
        color: '#ccc',
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#2c2c2c',
          width: 0.5,
        },
      },
      splitArea: {
        areaStyle: {
          color: contrastColor,
        },
      },
      axisPointer: {
        label: {
          backgroundColor: boxColor,
        },
      },
      nameTextStyle: {
        fontStyle: 'italic',
        color: 'gray',
      },
    };
  };

  const colorPalette = ['#dd6b66', '#759aa0', '#e69d87', '#8dc1a9', '#ea7e53', '#eedd78', '#73a373', '#73b9bc', '#7289ab', '#91ca8c', '#f49f42'];
  const theme = {
    color: colorPalette,
    backgroundColor: 'rgba(24, 25, 26)',
    tooltip: {
      backgroundColor: boxColor,
      textStyle: {
        color: contrastColor,
      },
      borderWidth: 0,
      shadowBlur: 8,
      shadowColor: 'rgba(0, 0, 0, 0.618)',
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      axisPointer: {
        lineStyle: {
          color: contrastColor,
        },
        crossStyle: {
          color: contrastColor,
        },
      },
      renderMode: 'html',
    },
    grid: {
      containLabel: true,
    },
    legend: {
      textStyle: {
        color: contrastColor,
      },
    },
    textStyle: {
      color: contrastColor,
    },
    title: {
      left: 'center',
      top: 8,
      textStyle: {
        color: contrastColor,
        fontSize: 14,
        align: 'center',
      },
    },
    toolbox: {
      iconStyle: {
        borderColor: contrastColor,
      },
    },
    dataZoom: {
      textStyle: {
        color: contrastColor,
      },
    },
    timeline: {
      lineStyle: {
        color: contrastColor,
      },
      itemStyle: {
        color: colorPalette[1],
      },
      label: {
        color: contrastColor,
      },
      controlStyle: {
        color: contrastColor,
        borderColor: contrastColor,
      },
    },
    timeAxis: axisCommon(),
    logAxis: axisCommon(),
    valueAxis: axisCommon(),
    categoryAxis: axisCommon(),

    line: {
      symbol: 'circle',
    },
    graph: {
      color: colorPalette,
    },
    gauge: {
      title: {
        textStyle: {
          color: contrastColor,
        },
      },
    },
    candlestick: {
      itemStyle: {
        color: '#FD1050',
        color0: '#0CF49B',
        borderColor: '#FD1050',
        borderColor0: '#0CF49B',
      },
    },

    visualMap: {
      textStyle: {
        color: contrastColor,
      },
    },
  };
  // @ts-expect-error
  theme.categoryAxis.splitLine.show = false;
  registerTheme('dark', theme);
}
