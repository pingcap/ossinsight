'use client';

import React, { RefCallback, useCallback, useMemo, useState } from 'react';
import { AnalyzeChartContext, AnalyzeChartContextProps, useAnalyzeContext } from './context';
import { useRemoteData } from '@/utils/useRemoteData';
import { ShowSQLButton } from './ShowSQL';

export interface AnalyzeProps {
  query: string;
  params?: Record<string, any>;
  /** Show SHOW SQL button. Default: true */
  showSQL?: boolean;
  children: React.ReactNode | ((context: AnalyzeChartContextProps) => React.ReactNode);
}

export default function Analyze({ query, params, showSQL = true, children }: AnalyzeProps) {
  const { repoId, comparingRepoId } = useAnalyzeContext();

  const repoData = useRemoteData(query, { repoId, ...params }, repoId != null);
  const compareRepoData = useRemoteData(
    query,
    { repoId: comparingRepoId, ...params },
    comparingRepoId != null,
  );

  const [title, setTitle] = useState<string>();
  const [hash, setHash] = useState<string>();
  const [description, setDescription] = useState<string>();

  const headingRef: RefCallback<HTMLHeadingElement> = useCallback((el) => {
    if (el) {
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

  const sql = repoData.data?.sql;
  const queryParams = useMemo(() => ({ repoId, ...params }), [repoId, params]);

  return (
    <AnalyzeChartContext.Provider value={contextValue}>
      {showSQL && sql ? (
        <div style={{ position: 'relative' }}>
          <ShowSQLButton sql={sql} queryName={query} queryParams={queryParams} />
          {typeof children === 'function' ? children(contextValue) : children}
        </div>
      ) : (
        typeof children === 'function' ? children(contextValue) : children
      )}
    </AnalyzeChartContext.Provider>
  );
}
