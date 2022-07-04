import React, { createContext, ReactNode } from "react";
import Box from "@mui/material/Box";

export interface ChartWrapperProps {
  title?: string
  description?: string
  href?: string
  children: ReactNode
}

export interface ChartWrapperContextProps {
  title?: string
  description?: string
  href?: string
}

function ChartWrapper ({ title, description, href, children }: ChartWrapperProps) {
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
