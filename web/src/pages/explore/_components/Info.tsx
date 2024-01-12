import React, { PropsWithChildren } from 'react';
import { InfoOutlined } from '@mui/icons-material';
import { Box, IconButton, Tooltip } from '@mui/material';

export default function Info ({ children }: PropsWithChildren<{}>) {
  return (
    <Tooltip title={<Box p={1} fontSize={14}>{children}</Box>}>
      <IconButton>
        <InfoOutlined fontSize='inherit' />
      </IconButton>
    </Tooltip>
  );
}
