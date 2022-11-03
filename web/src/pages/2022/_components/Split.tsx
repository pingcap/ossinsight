import React, { ReactElement, useMemo } from 'react';
import { GridProps } from '@mui/material/Grid';
import { Breakpoint, Grid } from '@mui/material';

interface SplitProps extends Omit<GridProps, 'item' | 'container' | Breakpoint> {
  children: ReactElement[];
  reversed?: boolean;
}

export default function Split ({ children, reversed = false, ...props }: SplitProps) {
  const size = children.length;
  const xs = useMemo(() => 12, [size]);
  const md = useMemo(() => 12 / size, [size]);

  return (
    <Grid container justifyContent="space-between" alignItems="center" spacing={[2, 3, 4]} {...props}>
      {children.map((child, i) => (
        <Grid
          key={i}
          item
          xs={xs}
          md={md}
          order={reversed ? size - i : i}
          alignSelf='stretch'
        >
          {child}
        </Grid>
      ))}
    </Grid>
  );
}
