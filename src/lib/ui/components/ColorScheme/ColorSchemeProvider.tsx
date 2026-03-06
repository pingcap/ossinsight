import { ReactNode, useState } from 'react';
import { ColorSchemeContext } from './context';

export function ColorSchemeProvider ({ children }: { children: ReactNode}) {
  const [colorScheme, setColorScheme] = useState('auto');

  return (
    <ColorSchemeContext.Provider value={{ colorScheme, setColorScheme }}>
      {children}
    </ColorSchemeContext.Provider>
  )
}