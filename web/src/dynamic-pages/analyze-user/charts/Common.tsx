import React, { useContext } from 'react';
import { Grid, Legend, Title, Tooltip, withBaseOption } from '@djagger/echartsx';
import { ChartWrapperContext } from './ChartWrapper';
import { SliderDataZoomOption } from 'echarts/types/dist/shared';
import { isFiniteNumber } from '@site/src/utils/value';

export const SliderDataZoom = withBaseOption<SliderDataZoomOption>('dataZoom', { type: 'slider' }, 'DataZoom');

export const Common = ({ hideZoom = false, scrollY }: { hideZoom?: boolean, scrollY?: number }) => {
  const { title } = useContext(ChartWrapperContext);

  return (
    <>
      {!!title && <Title text={title} left="center" />}
      <Legend type="scroll" orient="horizontal" top={32} />
      <Grid top={64} left={8} right={isFiniteNumber(scrollY) ? 16 : 8} bottom={!hideZoom ? 48 : 8} containLabel />
      <Tooltip trigger="axis" axisPointer={{ type: 'shadow' }} />
      {!hideZoom ? <SliderDataZoom id="x" showDataShadow={false} /> : undefined}
      {isFiniteNumber(scrollY)
        ? <SliderDataZoom id="y" yAxisIndex={0} showDataShadow={false} showDetail={false} maxValueSpan={10}
                                 minValueSpan={scrollY} zoomLock handleStyle={{ opacity: 0 }} width={8} />
        : undefined}
    </>
  );
};
