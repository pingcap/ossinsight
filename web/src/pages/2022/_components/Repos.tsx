import React from 'react';
import colors from './colors.module.css';
import { A, LI, UL } from './styled';

import { Box, styled } from '@mui/material';

export interface ReposProps {
  color: string;
  category: string;
  value: number;
  percent: string;
  list: string[];
}

export default function Repos ({ color, category, value, percent, list }: ReposProps) {
  return (
    <Box
      className={colors[`${color}Box`]}
      position="relative"
      p={4}
      height="100%"
    >
      <Category>{category}: {value}</Category>
      <Percent>{percent}</Percent>
      <UL
        sx={{
          position: 'absolute',
          right: 16,
          bottom: 16,
          textAlign: 'right',
          fontWeight: 'bold',
          fontSize: 14,
        }}
      >
        {list.map(item => (
          <LI key={item}>
            {/^\S+\/\S+$/.test(item)
              ? (<A href={`https://ossinsight.io/analyze/${item}`} target="_blank" rel="noopener">{item}</A>)
              : (item)}
          </LI>
        ))}
      </UL>
    </Box>
  );
}

const Category = styled('div')({
  fontSize: '1em',
  fontWeight: 'bold',
  color: 'white',
});

const Percent = styled('div')({
  fontSize: '2.4em',
  fontWeight: 'bold',
  color: 'white',
  marginTop: 24,
});
