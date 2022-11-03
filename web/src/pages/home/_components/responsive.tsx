import { AllSystemCSSProperties } from '@mui/system/styleFunctionSx/styleFunctionSx';
import { SystemStyleObject } from '@mui/system';
import { Theme } from '@mui/material';

export function responsive<K extends keyof AllSystemCSSProperties> (key: K, sm: AllSystemCSSProperties[K], md: AllSystemCSSProperties[K], all: AllSystemCSSProperties[K]): (theme: Theme) => SystemStyleObject<Theme> {
  return (theme: Theme) => ({
    [key]: all,
    [theme.breakpoints.down('lg')]: {
      [key]: md,
    },
    [theme.breakpoints.down('md')]: {
      [key]: sm,
    },
  });
}

type SubSx<T extends Theme = Theme> = SystemStyleObject<T> | ((theme: T) => SystemStyleObject<T>);

function apply (theme: Theme, subSx: SubSx) {
  if (typeof subSx === 'function') {
    return subSx(theme);
  } else {
    return subSx;
  }
}

export function responsiveSx (sm: SubSx, md: SubSx, all: SubSx): (theme: Theme) => SystemStyleObject<Theme> {
  return (theme: Theme) => ({
    ...apply(theme, all),
    [theme.breakpoints.down('md')]: apply(theme, sm),
    [theme.breakpoints.down('lg')]: apply(theme, sm),
  });
}
