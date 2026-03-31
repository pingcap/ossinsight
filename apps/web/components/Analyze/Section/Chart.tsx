'use client';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';

const OrgChart = dynamic(
  () => import('@/components/Analyze/Section/OrgChart'),
  { ssr: false },
);
import { useSearchParams } from 'next/navigation';
import * as React from 'react';
import { twMerge } from 'tailwind-merge';

import { AnalyzeOwnerContext } from '@/components/Context/Analyze/AnalyzeOwner';
import { ShowSQLInline } from '@/components/Analyze/ShowSQL';

export interface ChartTemplateProps {
  name: string;
  visualizer: () => Promise<any>;
  searchParams?: Record<string, string>;
  className?: string;
  width?: number;
  height?: number;
  children?: React.ReactNode;
  innerSectionId?: string;
  /** Chart title — renders a title row with ShowSQL on the right */
  title?: string;
  /** Heading level for title. Default: h4 */
  titleLevel?: 'h2' | 'h3' | 'h4';
}

const TITLE_STYLES = {
  h2: 'text-[22px] font-semibold text-[#e9eaee]',
  h3: 'text-[18px] font-semibold text-[#e9eaee]',
  h4: 'text-[14px] font-medium text-[#e9eaee]',
} as const;

export default function ChartTemplate (props: ChartTemplateProps) {
  const {
    name,
    searchParams = {},
    className,
    width,
    height,
    children,
    innerSectionId,
    title,
    titleLevel = 'h4',
  } = props;

  const { id: orgId, login: orgLogin } = React.useContext(AnalyzeOwnerContext);
  const searchParamsFromUrl = useSearchParams();

  const periodMemo = React.useMemo(() => {
    return searchParamsFromUrl.get('period') || 'past_28_days';
  }, [searchParamsFromUrl]);

  const repoIdsMemo = React.useMemo(() => {
    return searchParamsFromUrl.getAll('repoIds') || [];
  }, [searchParamsFromUrl]);

  const [sql, setSql] = React.useState<string | undefined>();
  const [queryName, setQueryName] = React.useState<string | undefined>();

  const handleSQLReady = React.useCallback((sql: string, qName?: string) => {
    setSql(sql);
    setQueryName(qName);
  }, []);

  const queryParams = React.useMemo(() => ({ owner_id: orgId }), [orgId]);

  const [searchParamsMemo, searchParamsStrMemo] = React.useMemo(() => {
    const combinedSearchParams = {
      ...searchParams,
      owner_id: `${orgId}`,
      period: periodMemo,
    };
    const newSearchParams = new URLSearchParams(combinedSearchParams);
    if (repoIdsMemo.length > 0) {
      repoIdsMemo.forEach((repoId) => {
        newSearchParams.append('repo_ids', repoId);
      });
      return [
        { ...combinedSearchParams, repo_ids: repoIdsMemo },
        newSearchParams.toString(),
      ];
    }
    return [combinedSearchParams, newSearchParams.toString()];
  }, [orgId, periodMemo, repoIdsMemo, searchParams]);

  return (
    <div>
      {title && (
        <div className="flex items-center justify-between gap-4 mb-3">
          {React.createElement(titleLevel, { className: TITLE_STYLES[titleLevel] }, title)}
          {sql && <ShowSQLInline sql={sql} queryName={queryName} queryParams={queryParams} />}
        </div>
      )}
      <div
        className={twMerge('relative w-full h-full overflow-hidden', className)}
        style={{
          width: width ? `${width}px` : undefined,
          height: height ? `${height}px` : undefined,
        }}
      >
        <ErrorBoundary errorComponent={({ error }) => <p className='p-2 text-red-700 font-medium leading-6'>{error.message}</p>}>
          <OrgChart
            className='w-full h-full overflow-hidden'
            name={name}
            visualizer={props.visualizer}
            params={searchParamsMemo}
            orgId={orgId}
            orgLogin={orgLogin}
            onSQLReady={handleSQLReady}
          />
        </ErrorBoundary>
        {/* ChartLinks removed */}
        {children}
      </div>
    </div>
  );
}
