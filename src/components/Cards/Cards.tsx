import React, {cloneElement, PropsWithChildren, ReactNode, useMemo} from "react";
import Grid, {GridProps} from "@mui/material/Grid";

type GridSizeProps = Pick<GridProps, 'xs' | 'sm' | 'md' | 'lg' | 'xl'>

function withDefaultSizes (children: ReactNode, sizes: GridSizeProps, key?: string | number): ReactNode {
  if (Object.keys(sizes).length === 0) {
    return children
  }
  if (children instanceof Array) {
    return children.map((node, i) => withDefaultSizes(node, sizes, i))
  } else if (React.isValidElement(children)) {
    return cloneElement(children, Object.assign({}, children.props, sizes, {key: children.key ?? key}))
  } else {
    return children
  }
}

export interface CardsProps extends GridProps {
}

export default function Cards({xs, sm, md, lg, xl, children, ...props}: PropsWithChildren<CardsProps>) {
  const sizeProps = useMemo(() => {
    const res: GridSizeProps = {}
    if (xs) res.xs = xs
    if (sm) res.sm = sm
    if (md) res.md = md
    if (lg) res.lg = lg
    if (xl) res.xl = xl
    return res
  }, [xs, sm, md, lg, xl])

  return (
    <Grid container spacing={[2, 4, 8]} {...props}>
      {withDefaultSizes(children, sizeProps)}
    </Grid>
  )
}

