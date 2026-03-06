'use client';
import { widgetPageParams } from '@/app/widgets/[vendor]/[name]/utils';
import { ChartLinks } from '@/components/Analyze/Section/ChartLinks';

import { EmbeddedWidget } from '@/components/EmbeddedWidget';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';
// import { ArrowUpRightIcon, CodeIcon } from '@primer/octicons-react';
import { usePathname, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { twMerge } from 'tailwind-merge';

import { AnalyzeOwnerContext } from '@/components/Context/Analyze/AnalyzeOwner';

export interface ChartTemplateProps {
  name: string;
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

  const { id: orgId } = React.useContext(AnalyzeOwnerContext);
  const searchParamsFromUrl = useSearchParams() ?? new URLSearchParams();

  const periodMemo = React.useMemo(() => {
    return searchParamsFromUrl.get('period') || 'past_28_days';
  }, [searchParamsFromUrl]);

  const repoIdsMemo = React.useMemo(() => {
    return searchParamsFromUrl.getAll('repoIds') || [];
  }, [searchParamsFromUrl]);

  const [searchParamsMemo, searchParamsStrMemo] = React.useMemo(() => {
    const combinedSearchParams = {
      ...widgetPageParams,
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
        <EmbeddedWidget
          className='w-full h-full overflow-hidden'
          name={name}
          params={searchParamsMemo}
        />
      </ErrorBoundary>
      <ChartLinks name={name} searchParamsStr={searchParamsStrMemo} innerSectionId={innerSectionId} />
      {children}
    </div>
  );
}
