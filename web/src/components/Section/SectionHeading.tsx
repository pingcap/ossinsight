import React, { ReactNode } from 'react';
import { Typography } from '@mui/material';

export interface SectionHeadingProps {
  title: ReactNode;
  description: ReactNode;
}

const SectionHeading = ({ title, description }: SectionHeadingProps) => {
  return (
    <>
      <Typography variant="h2">{title}</Typography>
      <Typography variant="body2" sx={{ mt: 1, mb: 4 }}>{description}</Typography>
    </>
  );
};

export default SectionHeading;
