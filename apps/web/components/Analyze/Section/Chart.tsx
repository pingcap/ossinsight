'use client';
import { ChartLinks } from '@/components/Analyze/Section/ChartLinks';
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

export interface ChartTemplateProps {
  name: string;
  visualizer: () => Promise<any>;
  searchParams?: Record<string, string>;
  className?: string;
  width?: number;
  height?: number;
  children?: React.ReactNode;
  innerSectionId?: string;
}

export default function ChartTemplate (props: ChartTemplateProps) {
  const {
    name,
    searchParams = {},
    className,
    width,
    height,
    children,
    innerSectionId,
  } = props;

  const { id: orgId, login: orgLogin } = React.useContext(AnalyzeOwnerContext);
  const searchParamsFromUrl = useSearchParams();

  const periodMemo = React.useMemo(() => {
    return searchParamsFromUrl.get('period') || 'past_28_days';
  }, [searchParamsFromUrl]);

  const repoIdsMemo = React.useMemo(() => {
    return searchParamsFromUrl.getAll('repoIds') || [];
  }, [searchParamsFromUrl]);

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
    <div
      key={searchParamsStrMemo}
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
        />
      </ErrorBoundary>
      {/* ChartLinks removed */}
      {children}
    </div>
  );
}
