import React, { useContext } from "react";
import { Grid, Legend, Title, Tooltip, withBaseOption } from "@djagger/echartsx";
import { ChartWrapperContext } from "./ChartWrapper";
import { SliderDataZoomOption } from "echarts/types/dist/shared";

const SliderDataZoom = withBaseOption<SliderDataZoomOption>('dataZoom', { type: 'slider' }, 'DataZoom')

export const Common = ({ hideZoom = false }: { hideZoom?: boolean }) => {
  const { title } = useContext(ChartWrapperContext)

  return (
    <>
      {!!title && <Title text={title} left="center"/>}
      <Legend type="scroll" orient="horizontal" top={32}/>
      <Grid top={64} left={8} right={8} bottom={!hideZoom ? 48 : 8} containLabel/>
      <Tooltip trigger="axis" axisPointer={{ type: 'shadow' }} />
      {!hideZoom ? <SliderDataZoom showDataShadow={false} /> : undefined}
    </>
  )
}
