import React from 'react';
import Box from '@mui/material/Box';
import GeneralSearch from '@site/src/components/GeneralSearch';

export default function AnalyzeSearchNavbarItem () {
  return (
    <>
      <Box display='inline-flex' justifyContent='flex-start' alignItems='center' width='100%' minWidth='50px' maxWidth='300px' ml={1} flexShrink={10000} sx={{ '& > *': { width: '100%', maxWidth: 300, mx: 'unset', flex: 1 } }}>
        <GeneralSearch global />
      </Box>
    </>
  );
}
