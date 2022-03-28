import * as echarts from "echarts/core";

export function registerThemeCompareLight () {
  const contrastColor = '#6e7078';
  const colorPalette = ['#1890ff', '#2fc25b', '#facc14', '#223273', '#8543e0', '#13c2c2', '#3436c7', '#f04864', '#66B5FF', '#41D9C7', '#6EDB8F', '#9AE65C', '#E6965C', '#57AD71', '#738AE6', '#7564CC', '#A877ED', '#5C8EE6', '#70E0E0', '#5CA3E6', '#8082FF', '#DD81E6', '#F04864', '#FA7D92', '#D598D9'];
  echarts.registerTheme('compare-light', {
    color: colorPalette,
    backgroundColor: '#fff',
    graph: {
      color: colorPalette
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
    }
  });
}

export function registerThemeCompareDark () {
  const contrastColor = '#f5f6f7';
  const borderColor = '#b8bbc2';
  const axisCommon = function () {
    return {
      axisLine: {
        lineStyle: {
          color: borderColor
        }
      },
      axisTick: {
        lineStyle: {
          color: borderColor
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
          color: borderColor
        }
      }
    };
  };

  const colorPalette = ['#dd6b66','#759aa0','#e69d87','#8dc1a9','#ea7e53','#eedd78','#73a373','#73b9bc','#7289ab', '#91ca8c','#f49f42'];
  const theme = {
    color: colorPalette,
    backgroundColor: '#1e1e1e',
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
    },
  };
  echarts.registerTheme('compare-dark', theme);
}

export function registerThemeVintage (bg = true) {
  const colorPalette = ['#d87c7c', '#919e8b', '#d7ab82', '#6e7074', '#61a0a8', '#efa18d', '#787464', '#cc7e63', '#724e58', '#4b565b'];
  echarts.registerTheme('vintage', {
    color: colorPalette,
    backgroundColor: undefined,
    graph: {
      color: colorPalette
    }
  });
}

export function registerThemeDark(bg = true) {
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
    backgroundColor: undefined,
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
  // @ts-ignore
  theme.categoryAxis.splitLine.show = false;
  echarts.registerTheme('dark', theme);
}
