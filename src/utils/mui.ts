import {SxProps} from "@mui/system";
import {Theme} from "@mui/material/styles";


export function combineSx<T extends Theme = Theme>(...list: SxProps<T>[]): SxProps<T> {
  const res = []
  for (const sx of list) {
    if (Array.isArray(sx)) {
      res.push(...sx)
    } else {
      res.push(sx)
    }
  }
  return res
}