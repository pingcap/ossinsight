import React, { forwardRef, lazy, Suspense } from "react";
import type { ChartElement, ChartProps } from "@site/src/components/Chart/Chart";
import { styled } from "@mui/material/styles";

export type { ChartProps, ChartElement } from './Chart';

const PromiseChart = lazy(() => import('./Chart')) as ChartElement;

const Chart: ChartElement = forwardRef((props, ref) => {
  if (typeof window === 'undefined') {
    return <Placeholder sx={props.sx} />
  }
  return (
    <Suspense
      fallback={<Placeholder sx={props.sx} />}
    >
      <PromiseChart {...props} ref={ref} />
    </Suspense>
  );
});

const Placeholder = styled('div')({})

export default Chart;
