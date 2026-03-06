import { useContext } from 'react';
import { ColorSchemeContext } from './context';

export function useColorScheme () {
  return useContext(ColorSchemeContext);
}