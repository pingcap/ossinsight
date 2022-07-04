import React from "react";
import { Grid, Legend, Tooltip, withBaseOption } from "@djagger/echartsx";

const DataZoom = withBaseOption('dataZoom', {}, 'DataZoom')

export const Common = ({ hideZoom = false }: { hideZoom?: boolean }) => {
  return (
    <>
      <Legend type="scroll" orient="horizontal" top={24}/>
      <Grid left={8} right={8} bottom={!hideZoom ? 48 : 8} containLabel/>
      <Tooltip trigger="axis" axisPointer={{ type: 'shadow' }} />
      {!hideZoom ? <DataZoom /> : undefined}
    </>
  )
}
