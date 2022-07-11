import React, { createContext, ReactNode, RefObject, useEffect } from "react";
import Box from "@mui/material/Box";
import { EChartsType } from "echarts/core";
import { useAnalyzeUserContext } from "./context";

export interface ChartWrapperProps {
  title?: string
  description?: string
  href?: string
  children: ReactNode
  chart?: RefObject<EChartsType>
}

export interface ChartWrapperContextProps {
  title?: string
  description?: string
  href?: string
}

function ChartWrapper ({ title, description, href, chart, children }: ChartWrapperProps) {
  const { userId } = useAnalyzeUserContext()

  useEffect(() => {
    chart?.current?.dispatchAction({
      type: 'dataZoom',
      start: 0,
      end: 100,
    })
  }, [userId])

  return (
    <Box sx={{ mb: 4 }}>
      <ChartWrapperContext.Provider value={{title, description, href}}>
        {children}
      </ChartWrapperContext.Provider>
    </Box>
  )
}

export const ChartWrapperContext = createContext<ChartWrapperContextProps>({
})

export default ChartWrapper
