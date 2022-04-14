import React, {PropsWithChildren, useState} from "react";
import {createTheme} from "@mui/material";
import useThemeContext from '@theme/hooks/useThemeContext';
import ThemeProvider from "@mui/system/ThemeProvider";
import GroupSelectContext from "../GroupSelect/GroupSelectContext";

const ThemeAdaptor = ({children}: PropsWithChildren<any>) => {
  const {isDarkTheme} = useThemeContext();
  const theme = createTheme({
    palette: {
      mode: isDarkTheme ? 'dark' : undefined,
      primary: {
        main: 'rgb(37, 193, 159)'
      }
    },
  });

  const [group, setGroup] = useState<string>(undefined)

  return (
    <GroupSelectContext.Provider value={{ group, setGroup }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </GroupSelectContext.Provider>
  )
}

ThemeAdaptor.displayName = 'MuiThemeAdaptor'

export default ThemeAdaptor
