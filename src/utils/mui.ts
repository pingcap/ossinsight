import { SxProps } from '@mui/system';
import { SystemStyleObject } from '@mui/system/styleFunctionSx/styleFunctionSx';
import { Theme } from '@mui/material';

export function combineSx<T extends Theme = Theme> (...list: Array<SxProps<T> | undefined>): SxProps<T> {
  const res: Array<SystemStyleObject<T> | ((theme: T) => SystemStyleObject<T>)> = [];
  for (const sx of list) {
    if (sx) {
      if (sx instanceof Array) {
        sx.forEach(sx => {
          if (typeof sx !== 'boolean') {
            res.push(sx as SystemStyleObject<T> | ((theme: T) => SystemStyleObject<T>));
          }
        });
      } else {
        res.push(sx as SystemStyleObject<T> | ((theme: T) => SystemStyleObject<T>));
      }
    }
  }
  return res;
}
