import { Backdrop, CircularProgress } from '@mui/material';
import React from 'react';

export default function Loading ({ loading }: { loading?: boolean }) {
  return (
    <Backdrop open={loading ?? true} sx={{ position: 'absolute', zIndex: 100 }}>
      <CircularProgress />
    </Backdrop>
  );
}
