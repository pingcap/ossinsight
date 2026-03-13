import { CSSProperties } from 'react';
import { getTheme } from '../../../utils/theme';
import { BuiltinWidgetsMap } from '../../builtin-widgets';

export type BuiltinProps<K extends keyof BuiltinWidgetsMap> = {
  style?: CSSProperties
  className?: string
  colorScheme: string
} & BuiltinWidgetsMap[K]


export const useTheme = (colorScheme: string) => {
  return getTheme(colorScheme);
};