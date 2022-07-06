import React, { useContext } from "react";
import { Grid, Legend, Title, Tooltip, withBaseOption } from "@djagger/echartsx";
import { ChartWrapperContext } from "./ChartWrapper";

const DataZoom = withBaseOption('dataZoom', {}, 'DataZoom')

export const Common = ({ hideZoom = false }: { hideZoom?: boolean }) => {
  const { title } = useContext(ChartWrapperContext)

  return (
    <>
      {!!title && <Title text={title} left="center"/>}
      <Legend type="scroll" orient="horizontal" top={32}/>
      <Grid top={64} left={8} right={8} bottom={!hideZoom ? 48 : 8} containLabel/>
      <Tooltip trigger="axis" axisPointer={{ type: 'shadow' }} />
      {!hideZoom ? <DataZoom /> : undefined}
    </>
  )
}
