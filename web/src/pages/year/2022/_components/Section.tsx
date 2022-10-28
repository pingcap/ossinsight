import Box from "@mui/material/Box";
import React, { PropsWithChildren } from "react";

export default function Section({ children }: PropsWithChildren) {
  return (
    <Box
      component="section"
      sx={{
        '&:not(:first-of-type)': {
          borderTop: '6px dashed #4D4D4D',
        },
        py: 12,
      }}
    >
      {children}
    </Box>
  );
}

export function SubSection({children}: PropsWithChildren) {
  return (
    <Box
      component="div"
      sx={{
        '&:not(:first-of-type)': {
          borderTop: '3px solid #4D4D4D',
        },
        py: 12,
      }}
    >
      {children}
    </Box>
  );
}
