import { useColorMode } from "@docusaurus/theme-common";
import { Theme, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

export function useIsDarkTheme () {
  const { colorMode } = useColorMode();
  return colorMode === 'dark';
}

export function useThemeMediaQuery (getMediaQuery: (theme: Theme) => string) {
  const theme = useTheme()
  return useMediaQuery(getMediaQuery(theme))
}