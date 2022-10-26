import { useColorMode } from "@docusaurus/theme-common";

export function useIsDarkTheme () {
  const { colorMode } = useColorMode();
  return colorMode === 'dark';
}