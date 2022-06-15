import Box from '@mui/material/Box';
import React from 'react';
import AnalyzeSelector from '../../../components/AnalyzeSelector';

export default function AnalyzeSelectorComponent () {
  return (
    <Box
      mt={4}
      display='flex'
      justifyContent='flex-end'
      sx={{ '> *': { flex: 1, maxWidth: 450, mx: 'unset' } }}
    >
      <AnalyzeSelector align='left' size='large' contrast />
    </Box>
  )
}