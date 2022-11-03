import { SxProps } from '@mui/system';
import { SystemStyleObject } from '@mui/system/styleFunctionSx/styleFunctionSx';
import { Theme } from '@mui/material';

export function combineSx<T extends Theme = Theme> (...list: Array<SxProps<T> | undefined>): SxProps<T> {
  const res: Array<SystemStyleObject<Theme> | ((theme: Theme) => SystemStyleObject<Theme>)> = [];
  for (const sx of list) {
    if (sx) {
      if (sx instanceof Array) {
        sx.forEach(sx => {
          if (typeof sx !== 'boolean') {
            res.push(sx);
          }
        });
      } else {
        res.push(sx);
      }
    }
  }
  return res;
}
