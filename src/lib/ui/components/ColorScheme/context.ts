import { createContext } from 'react';

type ColorSchemeContextValues = {
  colorScheme: string
  setColorScheme: (colorScheme: string) => void
}

export const ColorSchemeContext = createContext<ColorSchemeContextValues>({
  colorScheme: 'dark',
  setColorScheme: () => {},
})

