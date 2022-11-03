import React, { PropsWithChildren } from 'react';
import { Tab } from '@mui/material';

const IconTab = ({
  children,
  icon,
  ...props
}: PropsWithChildren<{ value: string, icon?: React.ReactNode }>) => {
  return (
    <Tab
      {...props}
      sx={{ textTransform: 'unset' }}
      label={<span>{icon}&nbsp;{children}</span>}
    />
  );
};

export default IconTab;
