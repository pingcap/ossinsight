'use client';
import { OwnerInfo } from '@/components/Analyze/utils';
import { createContext } from 'react';

export interface AnalyzeOwnerContextProps extends OwnerInfo {
}

export const AnalyzeOwnerContext = createContext<AnalyzeOwnerContextProps>({} as never);

// https://nextjs.org/docs/getting-started/react-essentials#context
export default function AnalyzeOwnerContextProvider ({
  children,
  data,
}: {
  children?: React.ReactNode;
  data: AnalyzeOwnerContextProps;
}) {
  return (
    <AnalyzeOwnerContext.Provider value={data}>
      {children}
    </AnalyzeOwnerContext.Provider>
  );
}
