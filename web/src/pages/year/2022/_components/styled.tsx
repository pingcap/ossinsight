import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { HTMLAttributes } from "react";
import React from "react";

export const HeadlineTag = styled('div')(({ theme }) => ({
  fontFamily: 'JetBrains Mono',
  background: 'transparent linear-gradient(89deg, #EA7E53 0%, #3E2A75 100%) 0% 0% no-repeat padding-box',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 40,
  fontWeight: 'bold',
  borderRadius: 62,
  marginBottom: 16,
  paddingLeft: 32,
  paddingRight: 32,
  paddingTop: 16,
  paddingBottom: 16,
  [theme.breakpoints.up('md')]: {
    width: 'max-content',
  },
}));

export const UL = styled('ul')({
  padding: 0,
  margin: 0,
  listStyle: 'none',
});

export const LI = styled('li')({
  boxSizing: 'border-box',
});

export const BR = styled('span')({
  '&:before': {
    content: '"\\00A0"',
  },
  display: 'block',
  width: '100%',
});

export const A = styled('a')({
  color: 'inherit',
  '&:hover': {
    color: 'inherit',
  }
})

export const Spacer = styled('span', { label: 'Spacer' })(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    flex: 1,
    alignSelf: 'stretch',
  }
}))

export const ResponsiveColumnFlex = styled(Box)(({ theme, maxWidth, height }) => ({
  height: 'unset',
  maxWidth: 'unset',
  [theme.breakpoints.up('md')]: {
    display: 'flex',
    flexDirection: 'column',
    height: height ?? '100%',
    maxWidth,
  },
}))

export const ResponsiveAlignedRight = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    alignItems: 'flex-end',
    justifyContent: 'center',
  }
}))

export const ResponsiveAlignedLeft = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    alignItems: 'flex-start',
    justifyContent: 'center',
  }
}))

export function ResponsiveAligned ({ type, ...props }: HTMLAttributes<HTMLDivElement> & { type: 'left' | 'right' }) {
  if (type === 'left') {
    return <ResponsiveAlignedLeft {...props} />
  } else {
    return <ResponsiveAlignedRight {...props} />
  }
}
