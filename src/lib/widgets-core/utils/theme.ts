type Theme = {
  CardHeader: {
    titleColor: string
    subtitleColor: string
  }
  Label: {
    color: string
  }
  Value: {
    color: string
  }
  Avatar: {
    fallbackColor: string;
  }

  Container: {
    backgroundColor: string
    Card: {
      backgroundColor: string
      /**
       * @deprecated
       */
      shadowColor: string
      borderColor: string
    }
  }

  Orphan: {
    backgroundColor: string
  }
}

type ColorSchemes = Record<string, Theme>

const light: Theme = {
  CardHeader: {
    titleColor: 'rgb(62, 62, 63)',
    subtitleColor: 'rgb(121, 121, 121)',
  },
  Label: {
    color: 'black',
  },
  Value: {
    color: 'black',
  },
  Avatar: {
    fallbackColor: '#f7f8f9',
  },

  Container: {
    backgroundColor: '#fff',
    Card: {
      backgroundColor: '#fff',
      shadowColor: 'rgba(219, 216, 199, 0.75)',
      borderColor: '#E0E0E0',
    },
  },
  Orphan: {
    backgroundColor: 'rgba(255,255,255,0)',
  },
};

const dark: Theme = {
  CardHeader: {
    titleColor: 'rgb(193, 193, 193)',
    subtitleColor: 'rgb(124, 124, 124)',
  },
  Label: {
    color: 'white',
  },
  Value: {
    color: 'white',
  },
  Avatar: {
    fallbackColor: 'rgb(37, 37, 39)',
  },
  Container: {
    backgroundColor: 'rgba(0, 0, 0, 0)',
    Card: {
      backgroundColor: 'rgb(36, 35, 49)',
      shadowColor: 'rgba(36, 39, 56, 0.25)',
      borderColor: '#2F2E35',
    },
  },
  Orphan: {
    backgroundColor: 'rgb(37, 37, 39)',
  },
};

const COLOR_SCHEMES: ColorSchemes = {
  light,
  dark,
};

export function getTheme (colorScheme: string): Theme {
  return COLOR_SCHEMES[colorScheme] ?? dark;
}
