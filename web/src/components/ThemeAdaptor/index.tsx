import React, { PropsWithChildren, useState } from 'react';
import { createTheme } from '@mui/material';
import ThemeProvider from '@mui/system/ThemeProvider';
import GroupSelectContext from '../GroupSelect/GroupSelectContext';
import { useIsDarkTheme } from '@site/src/hooks/theme';

const ThemeAdaptor = ({ children, dark }: PropsWithChildren<{ dark?: boolean }>) => {
  const isDarkTheme = useIsDarkTheme();
  const theme = createTheme({
    palette: {
      mode: (dark ?? isDarkTheme) ? 'dark' : undefined,
      primary: {
        main: '#FFE895',
        contrastText: '#1C1E21',
      },
    },
    typography: {
      h1: {
        fontFamily: 'var(--ifm-heading-font-family)',
        fontSize: 'var(--ifm-h1-font-size)',
        fontWeight: 'var(--ifm-heading-font-weight)',
        lineHeight: 'var(--ifm-heading-line-height)',
      },
      h2: {
        fontFamily: 'var(--ifm-heading-font-family)',
        fontSize: 'var(--ifm-h2-font-size)',
        fontWeight: 'var(--ifm-heading-font-weight)',
        lineHeight: 'var(--ifm-heading-line-height)',
      },
      h3: {
        fontFamily: 'var(--ifm-heading-font-family)',
        fontSize: 'var(--ifm-h3-font-size)',
        fontWeight: 'var(--ifm-heading-font-weight)',
        lineHeight: 'var(--ifm-heading-line-height)',
      },
      h4: {
        fontFamily: 'var(--ifm-heading-font-family)',
        fontSize: 'var(--ifm-h4-font-size)',
        fontWeight: 'var(--ifm-heading-font-weight)',
        lineHeight: 'var(--ifm-heading-line-height)',
      },
      h5: {
        fontFamily: 'var(--ifm-heading-font-family)',
        fontSize: 'var(--ifm-h5-font-size)',
        fontWeight: 'var(--ifm-heading-font-weight)',
        lineHeight: 'var(--ifm-heading-line-height)',
      },
      h6: {
        fontFamily: 'var(--ifm-heading-font-family)',
        fontSize: 'var(--ifm-h6-font-size)',
        fontWeight: 'var(--ifm-heading-font-weight)',
        lineHeight: 'var(--ifm-heading-line-height)',
      },
    },
  });

  const [group, setGroup] = useState<string>();

  return (
    <GroupSelectContext.Provider value={{ group, setGroup }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </GroupSelectContext.Provider>
  );
};

ThemeAdaptor.displayName = 'MuiThemeAdaptor';

export default ThemeAdaptor;
