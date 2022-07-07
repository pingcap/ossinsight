import Box from '@mui/material/Box';
import React from 'react';
import AnalyzeSelector from '../../../../../components/AnalyzeSelector';
import GeneralSearch from '../../../../../components/GeneralSearch';
import Typography from "@mui/material/Typography";

const GeneralSearchLine = () => {
  return (
    <>
      <Box
        mt={4}
        display='flex'
        justifyContent='flex-end'
        sx={{ '> *': { flex: 1, maxWidth: 450, mx: 'unset' } }}
      >
        <GeneralSearch align='left' size='large' contrast />
      </Box>
      <Typography variant='body2' mt={1} color='#7c7c7c'>
        Quick insight on repository or developer from GitHub
        <br />
        to see status and rankings.
      </Typography>
    </>
  )
}

export default GeneralSearchLine
