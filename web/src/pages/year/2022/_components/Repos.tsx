import Box, { BoxProps } from "@mui/material/Box";
import React from "react";
import { styled } from "@mui/material/styles";
import colors from './colors.module.css';
import { A, LI, UL } from "./styled";

export interface ReposProps {
  color: string;
  category: string;
  value: number;
  percent: string;
  list: string[];
}

export default function Repos({ color, category, value, percent, list }: ReposProps) {
  return (
    <Box
      className={colors[`${color}Box`]}
      fontFamily="JetBrains Mono"
      position="relative"
      p={4}
      height='100%'
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
        }}
      >
        {list.map(item => (
          <LI>
            {/^\S+\/\S+$/.test(item)
              ? (<A href={`https://github.com/${item}`} target="_blank" rel="noopener">{item}</A>) : (item)}
          </LI>
        ))}
      </UL>
    </Box>
  );
}

const Category = styled('div')({
  fontSize: 24,
  fontWeight: 'bold',
  color: 'white',
});

const Percent = styled('div')({
  fontSize: 72,
  fontWeight: 'bold',
  color: 'white',
  marginTop: 24,
});
