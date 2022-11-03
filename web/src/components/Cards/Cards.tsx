import React, { cloneElement, PropsWithChildren, ReactNode, useMemo } from 'react';
import { GridProps } from '@mui/material/Grid';
import { notNullish } from '@site/src/utils/value';

import { Grid } from '@mui/material';

type GridSizeProps = Pick<GridProps, 'xs' | 'sm' | 'md' | 'lg' | 'xl'>;

function isIterable<T> (e: any): e is Iterable<T> {
  return typeof e[Symbol.iterator] === 'function';
}

function withDefaultSizes (children: ReactNode, sizes: GridSizeProps, key?: string | number): ReactNode {
  if (Object.keys(sizes).length === 0) {
    return children;
  }
  if (typeof children === 'string') {
    return children;
  } else if (isIterable(children)) {
    return Array.from(children).map((node, i) => withDefaultSizes(node, sizes, i));
  } else if (React.isValidElement(children)) {
    return cloneElement(children, Object.assign({}, children.props, sizes, { key: children.key ?? key }));
  } else {
    return children;
  }
}

export interface CardsProps extends GridProps {
}

export default function Cards ({ xs, sm, md, lg, xl, children, ...props }: PropsWithChildren<CardsProps>) {
  const sizeProps = useMemo(() => {
    const res: GridSizeProps = {};
    if (notNullish(xs)) res.xs = xs;
    if (notNullish(sm)) res.sm = sm;
    if (notNullish(md)) res.md = md;
    if (notNullish(lg)) res.lg = lg;
    if (notNullish(xl)) res.xl = xl;
    return res;
  }, [xs, sm, md, lg, xl]);

  return (
    <Grid container spacing={[2, 4, 8]} {...props}>
      {withDefaultSizes(children, sizeProps)}
    </Grid>
  );
}
