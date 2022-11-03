import { useColorMode } from '@docusaurus/theme-common';
import { useTheme } from '@mui/material/styles';
import { Theme, useMediaQuery } from '@mui/material';

export function useIsDarkTheme () {
  const { colorMode } = useColorMode();
  return colorMode === 'dark';
}

export function useThemeMediaQuery (getMediaQuery: (theme: Theme) => string) {
  const theme = useTheme();
  return useMediaQuery(getMediaQuery(theme));
}
