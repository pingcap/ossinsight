import React, {PropsWithChildren} from "react";
import {createTheme} from "@mui/material";
import useThemeContext from '@theme/hooks/useThemeContext';
import ThemeProvider from "@mui/system/ThemeProvider";

const ThemeAdaptor = ({children}: PropsWithChildren<any>) => {
  const {isDarkTheme} = useThemeContext();
  const theme = createTheme({
    palette: {
      mode: isDarkTheme ? 'dark' : undefined,
      primary: {
        main: 'hsl(255, 68%, 45%)'
      }
    },
  });

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

ThemeAdaptor.displayName = 'MuiThemeAdaptor'

export default ThemeAdaptor
