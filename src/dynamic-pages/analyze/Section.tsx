import React, {PropsWithChildren} from 'react';
import Box from '@mui/material/Box';
import {useInView} from 'react-intersection-observer';
import InViewContext from '../../components/InViewContext';

export default function Section({children}: PropsWithChildren<{}>) {
  const { inView, ref } = useInView({ fallbackInView: true })



  return (
    <Box component="section" sx={{py: 4}} ref={ref}>
      <InViewContext.Provider value={{inView}}>
        {children}
      </InViewContext.Provider>
    </Box>
  );
}