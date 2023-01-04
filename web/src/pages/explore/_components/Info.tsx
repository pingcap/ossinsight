import React, { PropsWithChildren } from 'react';
import { InfoOutlined } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

export default function Info ({ children }: PropsWithChildren<{}>) {
  return (
    <Tooltip title={children}>
      <IconButton>
        <InfoOutlined fontSize='inherit' />
      </IconButton>
    </Tooltip>
  );
}
