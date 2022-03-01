import React, {useMemo} from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import {BarChart,} from 'echarts/charts';
import {GridComponent, TitleComponent, TooltipComponent,} from 'echarts/components';
import {CanvasRenderer,} from 'echarts/renderers';
import * as echarts from "echarts/core";
import useThemeContext from '@theme/hooks/useThemeContext';

// Register the required components
echarts.use(
  [TitleComponent, TooltipComponent, GridComponent, BarChart, CanvasRenderer]
);

export default function ({data, loading, clear, size, n, deps, categoryIndex, valueIndex}) {
  const options = useMemo(() => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        containLabel: true,
        left: clear ? 0 : 8,
        top: clear ? 0 : 16,
        bottom: clear ? 0 : 16
      },
      xAxis: {
        type: 'value',
        position: 'top'
      },
      yAxis: {
        type: 'category',
        data: data.map(d => d[categoryIndex]),
        inverse: true,
        axisLabel: {
          rotate: 0,
          formatter: function (value, index) {
            if (value.indexOf('/') < 0) {
              return value
            }
            return value.split('/')[1];
          }
        }
      },
      series: [
        {
          name: 'Count',
          data: data.map(d => d[valueIndex]),
          type: 'bar',
          barWidth: clear ? size / 2 : size,
        }
      ]
    }
  }, [data, ...deps, categoryIndex, valueIndex, size, clear])

  const height = useMemo(() => {
    const height = loading ? 400 : Math.max(Math.min(n, data.length), 5) * (size * (clear ? 1 : 1.5))

    return height
  }, [size, loading, clear])


  const opts = useMemo(() => {
    return {
      devicePixelRatio: window?.devicePixelRatio ?? 1,
      renderer: 'canvas',
      height: height,
      width: 'auto',
      locale: 'en'
    }
  }, [height])

  const onEvents = useMemo(() => {
    return {
      'click': params => {
        if ('name' in params) {
          window.open(`https://github.com/${params.name}`).then()
        }
      }
    }
  }, [])

  const {isDarkTheme} = useThemeContext();

  return (
    <ReactEChartsCore
      showLoading={loading}
      echarts={echarts}
      option={options}
      notMerge={true}
      lazyUpdate={true}
      theme={isDarkTheme ? 'dark' : 'vintage'}
      style={{
        height,
        marginBottom: 16,
        borderRadius: 'var(--ifm-global-radius)',
        overflow: 'hidden'
      }}
      opts={opts}
      onEvents={onEvents}
    />
  )
}


function registerThemeVintage () {
  const colorPalette = ['#d87c7c', '#919e8b', '#d7ab82', '#6e7074', '#61a0a8', '#efa18d', '#787464', '#cc7e63', '#724e58', '#4b565b'];
  echarts.registerTheme('vintage', {
    color: colorPalette,
    backgroundColor: '#fef8ef',
    graph: {
      color: colorPalette
    }
  });

}

function registerThemeDark () {
  const contrastColor = '#eee';
  const axisCommon = function () {
    return {
      axisLine: {
        lineStyle: {
          color: contrastColor
        }
      },
      axisTick: {
        lineStyle: {
          color: contrastColor
        }
      },
      axisLabel: {
        textStyle: {
          color: contrastColor
        }
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#aaa'
        }
      },
      splitArea: {
        areaStyle: {
          color: contrastColor
        }
      }
    };
  };

  const colorPalette = ['#dd6b66','#759aa0','#e69d87','#8dc1a9','#ea7e53','#eedd78','#73a373','#73b9bc','#7289ab', '#91ca8c','#f49f42'];
  const theme = {
    color: colorPalette,
    backgroundColor: '#333',
    tooltip: {
      axisPointer: {
        lineStyle: {
          color: contrastColor
        },
        crossStyle: {
          color: contrastColor
        }
      }
    },
    legend: {
      textStyle: {
        color: contrastColor
      }
    },
    textStyle: {
      color: contrastColor
    },
    title: {
      textStyle: {
        color: contrastColor
      }
    },
    toolbox: {
      iconStyle: {
        normal: {
          borderColor: contrastColor
        }
      }
    },
    dataZoom: {
      textStyle: {
        color: contrastColor
      }
    },
    timeline: {
      lineStyle: {
        color: contrastColor
      },
      itemStyle: {
        normal: {
          color: colorPalette[1]
        }
      },
      label: {
        normal: {
          textStyle: {
            color: contrastColor
          }
        }
      },
      controlStyle: {
        normal: {
          color: contrastColor,
          borderColor: contrastColor
        }
      }
    },
    timeAxis: axisCommon(),
    logAxis: axisCommon(),
    valueAxis: axisCommon(),
    categoryAxis: axisCommon(),

    line: {
      symbol: 'circle'
    },
    graph: {
      color: colorPalette
    },
    gauge: {
      title: {
        textStyle: {
          color: contrastColor
        }
      }
    },
    candlestick: {
      itemStyle: {
        normal: {
          color: '#FD1050',
          color0: '#0CF49B',
          borderColor: '#FD1050',
          borderColor0: '#0CF49B'
        }
      }
    }
  };
  theme.categoryAxis.splitLine.show = false;
  echarts.registerTheme('dark', theme);
}

registerThemeVintage()
registerThemeDark()
