import Box from '@mui/material/Box';
import React from 'react';
import AnalyzeSelector from '../../../../../components/AnalyzeSelector';
import GeneralSearch from '../../../../../components/GeneralSearch';

const AnalyzeSelectorLine = () => {
  return (
    <Box
      mt={4}
      display='flex'
      justifyContent='flex-end'
      sx={{ '> *': { flex: 1, maxWidth: 450, mx: 'unset' } }}
    >
      <GeneralSearch align='left' size='large' contrast />
    </Box>
  )
}

export default AnalyzeSelectorLine
