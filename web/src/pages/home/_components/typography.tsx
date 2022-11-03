import React from 'react';
import { TypographyProps } from '@mui/material/Typography';
import { combineSx } from '../../../utils/mui';
import { responsive } from './responsive';

import { Typography } from '@mui/material';

export const fontSizes = {
  h1: responsive('fontSize', 28, 48, 64),
  h2: responsive('fontSize', 24, 36, 48),
  h2plus: responsive('fontSize', 28, 48, 64),
  subtitle: responsive('fontSize', 14, 18, 24),
  body: responsive('fontSize', 12, 16, 20),
};

export const aligns = {
  heading: responsive('textAlign', 'center', undefined, undefined),
};

export const H1 = (props: TypographyProps<'h2'>) => (
  <Typography
    {...props}
    variant='h1'
    sx={combineSx(fontSizes.h1, aligns.heading, props.sx)}
  />
);

export const H2 = (props: TypographyProps<'h2'>) => (
  <Typography
    {...props}
    variant='h2'
    sx={combineSx(fontSizes.h2, aligns.heading, props.sx)}
  />
);

export const Span = (props: TypographyProps<'span'>) => (
  <Typography {...props} component='span' display='inline' variant='inherit' />
);

export const H2Plus = (props: TypographyProps<'span'>) => (
  <Typography {...props} component='span' display='inline' variant='inherit'
              sx={combineSx(props.sx, [fontSizes.h2plus, aligns.heading])} />
);

export const Headline = (props: TypographyProps<'p'>) => (
  <Typography
    {...props}
    component='div'
    variant='subtitle2'
    sx={[
      { color: '#C4C4C4' },
      fontSizes.subtitle,
      aligns.heading,
    ]}
  />
);

export const Subtitle = (props: TypographyProps<'p'>) => (
  <Typography
    {...props}
    component='p'
    variant='subtitle1'
    sx={[
      responsive('mt', 1, 2, 7),
      fontSizes.subtitle,
    ]}
  />
);

export const Body = (props: TypographyProps) => (
  <Typography
    {...props}
    variant='body2'
    sx={combineSx([
      { color: '#C4C4C4' },
      responsive('mt', 2, 4, 6),
      fontSizes.body,
    ], props.sx)}
  />
);
