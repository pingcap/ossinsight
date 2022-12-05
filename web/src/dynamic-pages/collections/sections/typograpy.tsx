import { Typography, TypographyProps } from '@mui/material';
import React from 'react';

export const H1 = ({ ...props }: TypographyProps) => {
  return <Typography variant="h1" color="primary.main" marginBottom={4} marginTop={4} {...props} />;
};

export const H2 = ({ ...props }: TypographyProps) => {
  return <Typography {...props} variant="h2" color="primary.main" marginBottom={2} marginTop={8} />;
};

export const H3 = ({ ...props }: TypographyProps) => {
  return <Typography {...props} variant="h3" marginBottom={2} marginTop={4} />;
};

export const H4 = ({ ...props }: TypographyProps) => {
  return <Typography {...props} variant="h4" />;
};

export const P1 = ({ ...props }: TypographyProps) => {
  return <Typography {...props} variant="body1" marginBottom={2} marginTop={0} fontSize={18} />;
};

export const P2 = ({ ...props }: TypographyProps) => {
  return <Typography {...props} variant="body1" marginBottom={2} marginTop={0} fontSize={16} color={'#7c7c7c'}/>;
};
