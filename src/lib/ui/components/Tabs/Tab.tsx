import { ReactElement, ReactNode } from 'react';

export interface TabProps {
  value: string;
  title: ReactNode;
  icon?: ReactElement;
  children: ReactNode;
}

export function Tab (_: TabProps) {
  return null;
}
