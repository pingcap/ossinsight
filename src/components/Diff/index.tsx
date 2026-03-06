import React from 'react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Box } from '@mui/material';

const formatNumber = (v: number) => v.toFixed(1).replace(/[.,]0$/, '');

const up = <ArrowUpwardIcon fontSize="inherit" sx={{ verticalAlign: 'text-bottom' }} />;
const down = <ArrowDownwardIcon fontSize="inherit" sx={{ verticalAlign: 'text-bottom' }} />;
const red = '#E30C34';
const green = '#52FF52';

const Diff = ({ val, suffix, reverse = false }: { val: number, suffix?: string, reverse?: boolean }) => {
  if (val > 0) {
    return (
      <span className="diff" style={{ color: reverse ? red : green }}>
        {reverse ? down : up}
        <Box component='span' fontSize={14}>
          {formatNumber(val)}{suffix}
        </Box>
      </span>
    );
  } else if (val < 0) {
    return (
      <span className="diff" style={{ color: reverse ? green : red }}>
        {reverse ? up : down}
        <Box component='span' fontSize={14}>
          {formatNumber(-val)}{suffix}
        </Box>
      </span>
    );
  } else {
    return <span className="diff" style={{ color: 'gray' }}></span>;
  }
};

export default Diff;
