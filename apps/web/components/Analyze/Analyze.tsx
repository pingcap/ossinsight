'use client';

import React, { RefCallback, useCallback, useMemo, useState } from 'react';
import { AnalyzeChartContext, AnalyzeChartContextProps, useAnalyzeContext } from './context';
import { useRemoteData } from '@/utils/useRemoteData';
import { ShowSQLInline } from './ShowSQL';

const TITLE_STYLES = {
  h2: 'text-[22px] font-semibold text-[#e9eaee]',
  h3: 'text-[18px] font-semibold text-[#e9eaee]',
  h4: 'text-[14px] font-medium text-[#e9eaee]',
} as const;

export interface AnalyzeProps {
  query: string;
  params?: Record<string, any>;
  /** Title — renders a title row with ShowSQL on the right */
  title?: string;
  /** Heading level for title. Default: h4 */
  titleLevel?: 'h2' | 'h3' | 'h4';
  /** Show ShowSQL when no title. Default: false */
  showSQL?: boolean;
  children: React.ReactNode | ((context: AnalyzeChartContextProps) => React.ReactNode);
}

export default function Analyze({ query, params, title, titleLevel = 'h4', showSQL = false, children }: AnalyzeProps) {
  const { repoId, comparingRepoId } = useAnalyzeContext();

  const repoData = useRemoteData(query, { repoId, ...params }, repoId != null);
  const compareRepoData = useRemoteData(
    query,
    { repoId: comparingRepoId, ...params },
    comparingRepoId != null,
  );

  const [sectionTitle, setSectionTitle] = useState<string>();
  const [hash, setHash] = useState<string>();
  const [description, setDescription] = useState<string>();

  const headingRef: RefCallback<HTMLHeadingElement> = useCallback((el) => {
    if (el) {
      setSectionTitle(el.textContent?.trim());
      setHash(el.id);
    } else {
      setSectionTitle(undefined);
      setHash(undefined);
    }
  }, []);

  const descriptionRef: RefCallback<HTMLParagraphElement> = useCallback((el) => {
    setDescription(el?.textContent?.trim() ?? undefined);
  }, []);

  const contextValue = useMemo<AnalyzeChartContextProps>(() => ({
    query,
    data: repoData,
    compareData: compareRepoData,
    title: sectionTitle,
    hash,
    description,
    headingRef,
    descriptionRef,
  }), [query, repoData, compareRepoData, sectionTitle, hash, description, headingRef, descriptionRef]);

  const sql = repoData.data?.sql;
  const queryParams = useMemo(() => ({ repoId, ...params }), [repoId, params]);

  const sqlButton = sql
    ? <ShowSQLInline sql={sql} queryName={query} queryParams={queryParams} />
    : null;

  const content = typeof children === 'function' ? children(contextValue) : children;

  return (
    <AnalyzeChartContext.Provider value={contextValue}>
      {title ? (
        <div>
          <div className="flex items-center justify-between gap-4 mb-3">
            {React.createElement(titleLevel, { className: TITLE_STYLES[titleLevel] }, title)}
            {sqlButton}
          </div>
          {content}
        </div>
      ) : showSQL && sqlButton ? (
        <div>
          <div className="flex justify-end mb-1">{sqlButton}</div>
          {content}
        </div>
      ) : (
        content
      )}
    </AnalyzeChartContext.Provider>
  );
}
