import React, { ForwardedRef, forwardRef, RefAttributes, useEffect, useRef } from 'react';
import ChartJs, {
  ChartConfiguration,
  ChartConfigurationCustomTypesPerDataset,
  ChartType,
  DefaultDataPoint,
} from 'chart.js/auto';
import { applyForwardedRef } from '@site/src/utils/ref';
import { unstable_serialize } from 'swr';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system/styleFunctionSx';
import './defaults';
import { useFonts } from './fonts';
import { notNullish } from '@site/src/utils/value';

import { styled } from '@mui/material';

export type ChartProps<TType extends ChartType = ChartType, TData = DefaultDataPoint<TType>, TLabel = unknown> = {
  fallbackImage?: string;
  name?: string;
  once?: boolean;
  aspect?: number;
  sx?: SxProps<Theme>;
} & (ChartConfiguration<TType, TData, TLabel> | ChartConfigurationCustomTypesPerDataset<TType, TData, TLabel>);

const CanvasChart: ChartElement = forwardRef(function CanvasChart<TType extends ChartType = ChartType, TData = DefaultDataPoint<TType>, TLabel = unknown> ({
  fallbackImage,
  name,
  once,
  sx,
  aspect,
  ...config
}: ChartProps<TType, TData, TLabel>, ref: ForwardedRef<ChartJs<TType, TData, TLabel> | undefined>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJs<TType, TData, TLabel>>();

  useEffect(() => {
    if (notNullish(canvasRef.current)) {
      const chartInstance = chartRef.current = new ChartJs(canvasRef.current, config);
      applyAspect(chartInstance, aspect);
      applyForwardedRef(ref, chartInstance);
      chartInstance.update();
    }
    return () => {
      if (notNullish(chartRef.current)) {
        chartRef.current.destroy();
      }
      chartRef.current = undefined;
      applyForwardedRef(ref, undefined);
    };
  }, []);

  useEffect(() => {
    const chartInstance = chartRef.current;
    if (notNullish(chartInstance)) {
      applyAspect(chartInstance, aspect);
      chartInstance.update('none');
    }
  }, [aspect]);

  const dataDep = unstable_serialize(config.data);

  useEffect(() => {
    if (!once && notNullish(chartRef.current)) {
      chartRef.current.data = config.data;
      chartRef.current.update();
    }
  }, [dataDep]);

  useEffect(() => {
    if (chartRef.current) {
      if (config.options) {
        chartRef.current.options = config.options;
        chartRef.current.update('none');
      }
    }
  }, [config.options]);

  useFonts(chartRef);

  return (
    <CanvasContainer sx={sx}>
      <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: isFinite(aspect ?? NaN) ? undefined : '100%' }} />
    </CanvasContainer>
  );
});

function applyAspect (chartInstance: ChartJs<any, any, any>, aspect: number | undefined) {
  if (isFinite(aspect ?? NaN)) {
    chartInstance.options.aspectRatio = aspect;
    chartInstance.options.maintainAspectRatio = true;
  } else {
    chartInstance.options.aspectRatio = undefined;
    chartInstance.options.maintainAspectRatio = false;
  }
}

const CanvasContainer = styled('div')({
  alignSelf: 'stretch',
});

const FallbackChart: ChartElement = forwardRef(function FallbackChart<TType extends ChartType = ChartType, TData = DefaultDataPoint<TType>, TLabel = unknown> ({
  fallbackImage,
  name,
  sx,
}: ChartProps<TType, TData, TLabel>, ref: ForwardedRef<ChartJs<TType, TData, TLabel> | undefined>) {
  if (fallbackImage) {
    return (
      <Img alt={name} src={fallbackImage} sx={sx} />
    );
  } else {
    return <CanvasContainer sx={sx} />;
  }
});

const Img = styled('img')({});

export type ChartElement = <TType extends ChartType = ChartType, TData = DefaultDataPoint<TType>, TLabel = unknown>(
  props: ChartProps<TType, TData, TLabel> & RefAttributes<ChartJs<TType, TData, TLabel> | undefined>,
) => JSX.Element | null;

const Chart: ChartElement = typeof window === 'undefined' ? FallbackChart : CanvasChart;
export default Chart;
