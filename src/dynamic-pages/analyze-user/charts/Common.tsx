import React from "react";
import { Grid, Legend, Tooltip, withBaseOption } from "@djagger/echartsx";

const DataZoom = withBaseOption('dataZoom', {}, 'DataZoom')

export const Common = () => {
  return (
    <>
      <Legend type="scroll" orient="horizontal" top={24}/>
      <Grid left={8} right={8} bottom={48} containLabel/>
      <Tooltip trigger="axis" axisPointer={{ type: 'shadow' }} />
      <DataZoom />
    </>
  )
}
