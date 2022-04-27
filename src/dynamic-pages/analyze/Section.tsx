import React, {PropsWithChildren} from 'react';
import Box from '@mui/material/Box';

export default function Section({children}: PropsWithChildren<{}>) {
  return (
    <Box component="section" sx={{py: 4}}>
      {children}
    </Box>
  );
}