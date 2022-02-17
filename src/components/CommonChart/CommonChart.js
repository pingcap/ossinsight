import React from "react";
import Divider from "@mui/material/Divider";
import ThemeProvider from "@mui/system/ThemeProvider";
import {createTheme} from "@mui/material";
import {LocalizationProvider} from "@mui/lab";
import DateAdapter from '@mui/lab/AdapterLuxon';
import Head from '@docusaurus/Head';
import useThemeContext from '@theme/hooks/useThemeContext';
import BrowserOnly from '@docusaurus/BrowserOnly';


function CommonChart({chart, noSearch, ...rest}) {
  const {form, query} = chart.useForm({ noSearch })
  const {isDarkTheme} = useThemeContext();
  const theme = createTheme({
    palette: {
      mode: isDarkTheme ? 'dark' : undefined,
      primary: {
        main: 'rgb(37, 193, 159)'
      }
    },
  });

  const child = React.createElement(chart.Chart, {
    ...query,
    ...rest
  })

  return (
    <LocalizationProvider dateAdapter={DateAdapter}>
      <ThemeProvider theme={theme}>
        <Head>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          />
        </Head>
        {form}
        <Divider sx={{my: 2}} />
        {child}
      </ThemeProvider>
    </LocalizationProvider>
  )
}

export default function (props) {
  return <BrowserOnly>{() => <CommonChart {...props} />}</BrowserOnly>
}
