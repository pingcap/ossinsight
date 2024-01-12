import React, { HTMLAttributes } from 'react';

import { styled, Box } from '@mui/material';

export const HeadlineTag = styled('div')(({ theme }) => ({
  background: 'transparent linear-gradient(89deg, #EA7E53 0%, #3E2A75 100%) 0% 0% no-repeat padding-box',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.2em',
  fontWeight: 'bold',
  borderRadius: 62,
  marginBottom: 16,
  padding: '12px 24px',
  [theme.breakpoints.up('sm')]: {
    width: 'max-content',
    paddingTop: 16,
    paddingBottom: 16,
    padding: '16px 32px',
  },
}));

export const AdditionalTag = styled('div')(({ theme }) => ({
  background: 'transparent linear-gradient(89deg, #EA7E5380 0%, #3E2A7580 100%) 0% 0% no-repeat padding-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.6em',
  fontWeight: 'normal',
  borderRadius: 6,
  marginBottom: theme.spacing(1.5),
  padding: theme.spacing(0.5, 1),
  color: '#E3E3E3',
  width: 'max-content',
  [theme.breakpoints.up('sm')]: {
    paddingTop: 4,
    paddingBottom: 4,
    padding: theme.spacing(1, 2),
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
  },
});

export const Spacer = styled('span', { label: 'Spacer' })(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    flex: 1,
    alignSelf: 'stretch',
  },
}));

export const ResponsiveColumnFlex = styled(Box)(({ theme, maxWidth, height }) => ({
  height: 'unset',
  maxWidth: 'unset',
  [theme.breakpoints.up('md')]: {
    display: 'flex',
    flexDirection: 'column',
    height: height ?? '100%',
    maxWidth,
  },
}));

export const ResponsiveAlignedRight = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
}));

export const ResponsiveAlignedLeft = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
}));

export function ResponsiveAligned ({ type, ...props }: HTMLAttributes<HTMLDivElement> & { type: 'left' | 'right' }) {
  if (type === 'left') {
    return <ResponsiveAlignedLeft {...props} />;
  } else {
    return <ResponsiveAlignedRight {...props} />;
  }
}

export const MrO = styled('img')(({ theme }) => ({
  position: 'absolute',
  display: 'block',
  top: 96,
  right: 0,
  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },
}));

export const AnimatedDownIcon = styled(require('../_icons/arrow.svg').default)(({ theme }) => ({
  position: 'absolute',
  top: 600,
  right: 170,
  opacity: 0.7,
  [theme.breakpoints.down('lg')]: {
    top: 268,
    right: 16,
  },
  [theme.breakpoints.down('md')]: {
    top: 328,
  },
}));

export const Footnote = styled('div')(({ theme }) => ({
  color: '#7C7C7C',
  fontSize: 10,
  marginTop: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    fontSize: 13,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
}));
