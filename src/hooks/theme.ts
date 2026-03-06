import { useTheme } from '@mui/material/styles';
import { Theme, useMediaQuery } from '@mui/material';

export function useIsDarkTheme () {
  const theme = useTheme();
  return theme.palette.mode === 'dark';
}

export function useThemeMediaQuery (getMediaQuery: (theme: Theme) => string) {
  const theme = useTheme();
  return useMediaQuery(getMediaQuery(theme));
}
