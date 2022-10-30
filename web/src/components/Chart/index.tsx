import React, { lazy, Suspense } from "react";
import type { ChartProps } from "@site/src/components/Chart/Chart";
import { styled } from "@mui/material/styles";

export type { ChartProps, ChartElement } from './Chart';

const PromiseChart = lazy(() => import('./Chart'));

const Chart = (props: ChartProps) => {
  if (typeof window === 'undefined') {
    return <Placeholder sx={props.sx} />
  }
  return (
    <Suspense
      fallback={<Placeholder sx={props.sx} />}
    >
      <PromiseChart {...props} />
    </Suspense>
  );
};

const Placeholder = styled('div')({})

export default Chart;
