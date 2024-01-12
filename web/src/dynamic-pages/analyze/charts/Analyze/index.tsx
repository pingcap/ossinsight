import React, { RefCallback, useCallback, useState } from 'react';
import { AnalyzeChartContext, AnalyzeChartContextProps, useAnalyzeContext } from '../context';
import { useRemoteData } from '@site/src/components/RemoteCharts/hook';
import { notNullish } from '@site/src/utils/value';

export interface AnalyzeProps {
  query: string;
  params?: object;
  children: React.ReactNode | ((context: AnalyzeChartContextProps) => React.ReactNode);
}

export default function Analyze ({ query, params, children }: AnalyzeProps) {
  const { repoId, comparingRepoId } = useAnalyzeContext();
  const repoData = useRemoteData(query, { repoId, ...params }, false, notNullish(repoId));
  const compareRepoData = useRemoteData(query, { repoId: comparingRepoId, ...params }, false, notNullish(comparingRepoId));
  const [title, setTitle] = useState<string>();
  const [hash, setHash] = useState<string>();
  const [description, setDescription] = useState<string>();

  const headingRef: RefCallback<HTMLHeadingElement> = useCallback((el) => {
    if (notNullish(el)) {
      setTitle(el.textContent?.trim());
      setHash(el.id);
    } else {
      setTitle(undefined);
      setHash(undefined);
    }
  }, []);

  const descriptionRef: RefCallback<HTMLParagraphElement> = useCallback((el) => {
    setDescription(el?.textContent?.trim() ?? undefined);
  }, []);

  const contextValue: AnalyzeChartContextProps = {
    query,
    data: repoData,
    compareData: compareRepoData,
    title,
    hash,
    description,
    headingRef,
    descriptionRef,
  };

  return (
    <AnalyzeChartContext.Provider value={contextValue}>
      {typeof children === 'function' ? children(contextValue) : children}
    </AnalyzeChartContext.Provider>
  );
}
