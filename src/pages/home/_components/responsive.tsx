import {AllSystemCSSProperties} from "@mui/system/styleFunctionSx/styleFunctionSx";
import {Theme} from "@mui/material/styles";
import {SystemStyleObject} from "@mui/system";

export function responsive<K extends keyof AllSystemCSSProperties> (key: K, sm: AllSystemCSSProperties[K], md: AllSystemCSSProperties[K], all: AllSystemCSSProperties[K]): (theme: Theme) => SystemStyleObject<Theme> {
  return (theme: Theme) => ({
    [key]: all,
    [theme.breakpoints.down('md')]: {
      [key]: sm
    },
    [theme.breakpoints.down('lg')]: {
      [key]: md
    }
  })
}

export function responsiveSx (sm: SystemStyleObject<Theme>, md: SystemStyleObject<Theme>, all: SystemStyleObject<Theme>): (theme: Theme) => SystemStyleObject<Theme> {
  return (theme: Theme) => ({
    ...all,
    mt: 3,
    [theme.breakpoints.down('md')]: sm,
    [theme.breakpoints.down('lg')]: md
  })
}