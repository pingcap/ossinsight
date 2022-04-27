import React, {PropsWithChildren, RefCallback, useCallback, useState} from 'react';
import {AnalyzeChartContext, useAnalyzeContext} from '../context';
import {useRemoteData} from '../../components/RemoteCharts/hook';

interface AnalyzeChildrenOptions {
  headingRef: RefCallback<HTMLHeadingElement>;
  descriptionRef: RefCallback<HTMLParagraphElement>;
}

export interface AnalyzeProps {
  query: string;
  params?: object
  children: React.ReactNode | ((options: AnalyzeChildrenOptions) => React.ReactNode);
}

export default function Analyze({query, params, children}: AnalyzeProps) {
  const {repoId, comparingRepoId} = useAnalyzeContext();
  const repoData = useRemoteData(query, {repoId, ...(params||{})}, false, !!repoId);
  const compareRepoData = useRemoteData(query, {repoId: comparingRepoId, ...(params||{})}, false, !!comparingRepoId);
  const [title, setTitle] = useState<string>();
  const [hash, setHash] = useState<string>();
  const [description, setDescription] = useState<string>();

  const headingRef: RefCallback<HTMLHeadingElement> = useCallback((el) => {
    if (el) {
      setTitle(el.textContent.trim());
      setHash(el.id);
    } else {
      setTitle(undefined);
      setHash(undefined);
    }
  }, []);

  const descriptionRef: RefCallback<HTMLParagraphElement> = useCallback((el) => {
    setDescription(el?.textContent.trim() ?? undefined);
  }, []);

  return (
    <AnalyzeChartContext.Provider
      value={{data: repoData, compareData: compareRepoData, title, hash, description}}
    >
      {typeof children === 'function' ? children({headingRef, descriptionRef}) : children}
    </AnalyzeChartContext.Provider>
  );
}
