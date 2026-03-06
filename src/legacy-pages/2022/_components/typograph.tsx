import { TypographyProps } from '@mui/material/Typography';
import React from 'react';

import { Typography } from '@mui/material';

export function H1 ({
  children,
  ...props
}: Omit<TypographyProps<'h1'>, 'variant' | 'fontSize' | 'color' | 'fontWeight'>) {
  return (
    <Typography variant="h1" fontFamily='inherit' fontSize='2em' {...props}>
      {children}
    </Typography>
  );
}

export function H2 ({
  children,
  ...props
}: Omit<TypographyProps<'h2'>, 'variant' | 'fontSize' | 'color' | 'fontWeight'>) {
  return (
    <Typography variant="h2" fontFamily='inherit' fontSize='1.4em' {...props}>
      {children}
    </Typography>
  );
}

export function H3 ({
  children,
  ...props
}: Omit<TypographyProps<'h3'>, 'variant' | 'fontSize' | 'color' | 'fontWeight'>) {
  return (
    <Typography variant="h3" fontFamily='inherit' fontSize='1.2em' {...props}>
      {children}
    </Typography>
  );
}

export function H4 ({
  children,
  ...props
}: Omit<TypographyProps<'h4'>, 'variant' | 'fontSize' | 'color' | 'fontWeight'>) {
  return (
    <Typography variant="h4" fontFamily='inherit' fontSize='1em' {...props}>
      {children}
    </Typography>
  );
}

export function P1 ({
  children,
  ...props
}: Omit<TypographyProps<'p'>, 'variant' | 'fontSize' | 'color' | 'fontWeight'>) {
  return (
    <Typography variant="body1" fontFamily='inherit' fontSize='0.8em' color="#E0E0E0" {...props}>
      {children}
    </Typography>
  );
}

export function P2 ({
  children,
  ...props
}: Omit<TypographyProps<'p'>, 'variant' | 'fontSize' | 'color' | 'fontWeight'>) {
  return (
    <Typography variant="body1" fontFamily='inherit' fontSize='0.8em' color="#7C7C7C" mt={[1, 2, 3]} {...props}>
      {children}
    </Typography>
  );
}
