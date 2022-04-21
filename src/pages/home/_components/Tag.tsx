import React, {PropsWithChildren} from "react";
import {styled} from "@mui/material/styles";
import {alpha} from "@mui/material";
import Box from "@mui/material/Box";
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

export interface TagProps {
  color: string
}

export default function Tag({color,children}: PropsWithChildren<TagProps>) {
  return (
    <Box component='span' sx={{color, backgroundColor: alpha(color, .1), display: 'inline-block', borderRadius: 1, px: 2, py: 1.5, fontSize: 24, lineHeight: 1}}>
      <ArrowRightIcon sx={{ ml: -1, mr: 0.5, verticalAlign: 'text-bottom' }}/>
      {children}
    </Box>
  )
}