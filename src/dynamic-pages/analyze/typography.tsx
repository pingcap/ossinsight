import React, {forwardRef} from 'react';
import {TypographyProps} from '@mui/material/Typography';
import {Typography} from '@mui/material';

export const H1 = forwardRef<HTMLHeadingElement, TypographyProps>((props: TypographyProps, ref) => {
  return <Typography {...props} variant="h1" color='primary.main' marginBottom={4} marginTop={8} ref={ref} />;
});

export const H2 = forwardRef<HTMLHeadingElement, TypographyProps>((props: TypographyProps, ref) => {
  return <Typography {...props} variant="h2" color='primary.main' marginBottom={4} marginTop={8} ref={ref} />;
});

export const H3 = forwardRef<HTMLHeadingElement, TypographyProps>((props: TypographyProps, ref) => {
  return <Typography {...props} variant="h3" marginBottom={4} marginTop={8} ref={ref} />;
});
