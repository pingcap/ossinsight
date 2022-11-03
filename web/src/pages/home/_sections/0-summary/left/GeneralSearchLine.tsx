import Box from '@mui/material/Box';
import React from 'react';
import GeneralSearch from '../../../../../components/GeneralSearch';
import Typography from '@mui/material/Typography';
import { aligns } from '../../../_components/typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const GeneralSearchLine = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      <Box
        mt={4}
        display="flex"
        justifyContent={['center', 'center', 'flex-end']}
        sx={{ '> *': { flex: 1, maxWidth: 450, mx: 'unset' } }}
      >
        <GeneralSearch align="left" size={isSmall ? undefined : 'large'} contrast />
      </Box>
      <Typography variant="body2" mt={1} color="#7c7c7c" sx={aligns.heading}>
        Deep insight into developers and repos on GitHub
        <br />
        about stars, pull requests, issues, pushes, comments, reviews...
      </Typography>
    </>
  );
};

export default GeneralSearchLine;
