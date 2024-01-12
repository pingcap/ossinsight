import { useThemeMediaQuery } from '@site/src/hooks/theme';

export default function useIsLarge () {
  return useThemeMediaQuery(theme => theme.breakpoints.up('md'));
}
