import React, { ForwardedRef, forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import ChartJs, {
  ChartConfiguration,
  ChartConfigurationCustomTypesPerDataset,
  ChartType,
  DefaultDataPoint,
} from "chart.js/auto";
import { applyForwardedRef } from "../../utils/ref";
import { unstable_serialize } from "swr";
import { styled, Theme } from "@mui/material/styles";
import { SxProps } from "@mui/system/styleFunctionSx";

export type ChartProps<TType extends ChartType = ChartType, TData = DefaultDataPoint<TType>, TLabel = unknown> = {
  fallbackImage?: string;
  name?: string;
  once?: boolean;
  aspect?: number;
  sx?: SxProps<Theme>;
} & (ChartConfiguration<TType, TData, TLabel> | ChartConfigurationCustomTypesPerDataset<TType, TData, TLabel>)

const CanvasChart: ChartElement = forwardRef<ChartJs>(function <TType extends ChartType = ChartType, TData = DefaultDataPoint<TType>, TLabel = unknown>({
    fallbackImage,
    name,
    once,
    sx,
    aspect,
    ...config
  }: ChartProps, ref: ForwardedRef<ChartJs>) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<ChartJs>();

    useLayoutEffect(() => {
      if (canvasRef.current) {
        const chartInstance = chartRef.current = new ChartJs(canvasRef.current, config);
        applyForwardedRef(ref, chartInstance);
      }
      return () => {
        if (chartRef.current) {
          chartRef.current.destroy();
        }
        chartRef.current = undefined;
        applyForwardedRef(ref, undefined);
      };
    }, []);

    useEffect(() => {
      const chartInstance = chartRef.current;
      if (chartInstance) {
        if (aspect) {
          chartInstance.options.aspectRatio = aspect;
          chartInstance.options.maintainAspectRatio = true;
        } else {
          chartInstance.options.aspectRatio = undefined;
          chartInstance.options.maintainAspectRatio = false;
        }
        chartInstance.update('resize');
      }
    }, [aspect]);

    const dataDep = unstable_serialize(config.data);
    const optionsDep = unstable_serialize(config.options);

    useEffect(() => {
      if (!once && chartRef.current) {
        chartRef.current.data = config.data;
        chartRef.current.update();
      }
    }, [dataDep]);

    useEffect(() => {
      if (!once && chartRef.current) {
        chartRef.current.options = config.options;
      }
    }, [optionsDep]);

    return (
      <Canvas ref={canvasRef} sx={sx} />
    );
  },
);

const Canvas = styled('canvas')({});

const FallbackChart: ChartElement = forwardRef<ChartJs>(function FallbackChart({
  fallbackImage,
  name,
  sx,
}: ChartProps, ref) {
  return (
    <Img alt={name} src={fallbackImage} sx={sx} />
  );
});

const Img = styled('img')({});

export type ChartElement = <TType extends ChartType = ChartType, TData = DefaultDataPoint<TType>, TLabel = unknown>(
  props: ChartProps<TType, TData, TLabel> & { ref?: ForwardedRef<ChartJs | undefined> },
) => JSX.Element

const Chart: ChartElement = typeof window === 'undefined' ? FallbackChart : CanvasChart;
export default Chart;
