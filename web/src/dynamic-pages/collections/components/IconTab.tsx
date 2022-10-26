import Tab from '@mui/material/Tab';
import React, { PropsWithChildren } from 'react';

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
