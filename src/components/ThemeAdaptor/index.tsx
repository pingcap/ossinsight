import React, {PropsWithChildren, useMemo} from "react";
import {createTheme} from "@mui/material";
import useThemeContext from '@theme/hooks/useThemeContext';
import ThemeProvider from "@mui/system/ThemeProvider";
import {Auth0Provider} from "@auth0/auth0-react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import {createHttpClient, HttpClientContext} from "../../lib/request";

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

  const {
    siteConfig: {customFields: {auth0: _auth0, apiBaseUrl}},
  } = useDocusaurusContext();

  const auth0 = _auth0 as { domain?: string, clientId?: string, callbackUrl?: string };

  const clientCtx = useMemo(() => ({ client: createHttpClient(apiBaseUrl as string) }), [apiBaseUrl])

  const child = (
    <ThemeProvider theme={theme}>
      <HttpClientContext.Provider value={clientCtx}>
        {children}
      </HttpClientContext.Provider>
    </ThemeProvider>
  )

  if (auth0.domain && auth0.clientId) {
    return (
      <Auth0Provider
        domain={auth0.domain}
        clientId={auth0.clientId}
      >
        {child}
      </Auth0Provider>
    )
  } else {
    return child
  }
}

ThemeAdaptor.displayName = 'MuiThemeAdaptor'

export default ThemeAdaptor
