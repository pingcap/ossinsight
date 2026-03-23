'use client';

import {
  getOrgActivityLocations,
  getOrgActivityOrgs,
  getCompletionRate,
} from '@/components/Analyze/utils';
import { TableSkeleton as TableSkeletonUI } from '@/components/ui/skeletons';
import { EmptyState } from '@/components/ui/empty-state';
import { usePerformanceOptimizedNetworkRequest } from '@/utils/usePerformanceOptimizedNetworkRequest';
import { Scale } from '@/components/ui/components/transitions';
import { alpha2ToTitle } from '@/utils/geo';
import { useSearchParams } from 'next/navigation';
import * as React from 'react';
import { ForwardedRef, forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import * as Tooltip from '@/components/ui/components/Tooltip';

const Table = forwardRef(function Table (props: {
  rows?: Array<Array<string | number>>;
  header?: Array<string>;
  maxRows?: number;
}, forwardedRef: ForwardedRef<any>) {
  const { rows, header, maxRows = 10 } = props;

  return (
    <>
      <table className={twMerge('min-w-full divide-y divide-gray-700')} ref={forwardedRef}>
        <thead>
          <tr>
            <th
              scope='col'
              className='py-1.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0'
            >
              {header?.[0]}
            </th>
            {header?.slice(1).map((h) => (
              <th
                key={h?.toString()}
                scope='col'
                className='px-3 py-1.5 text-left text-sm font-semibold text-white'
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-800'>
          {rows?.map((row) => (
            <tr key={row[0]}>
              <td className='whitespace-nowrap py-1 pl-4 pr-3 text-sm font-medium text-white sm:pl-0'>
                {row[0]}
              </td>
              {row?.slice(1).map((r) => (
                <td
                  key={r?.toString()}
                  className='whitespace-normal px-3 py-1 text-sm text-gray-300'
                >
                  {r}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
});

export function upperFirst (str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const TableSkeleton = forwardRef(function TableSkeleton ({}, forwardedRef: ForwardedRef<any>) {
  return (
    <div ref={forwardedRef}>
      <TableSkeletonUI rows={5} columns={3} />
    </div>
  );
});

export function GeoRankTableContent (props: {
  id: number;
  type: 'stars' | 'participants';
  role?: string;
  maxRows?: number;
  excludeSeenBefore?: boolean;
}) {
  const { id, type, maxRows = 10, role, excludeSeenBefore = false } = props;
  const repoIds = useRepoIds();
  const period = usePeriod();
  const {
    result: data = [],
    loading,
    ref,
  } = usePerformanceOptimizedNetworkRequest(
    getOrgActivityLocations,
    id, { activity: type, period, ...(role && { role }), repoIds, excludeSeenBefore },
  );

  const rowsMemo = React.useMemo(() => {
    return data
      .slice(0, maxRows)
      .map((d: any, idx: number) => [
        idx + 1,
        alpha2ToTitle(d.country_code),
        d[type],
      ]);
  }, [data, maxRows, type]);

  const headerMemo = React.useMemo(() => {
    return ['No.', 'Location', upperFirst(type)];
  }, [type]);

  return (
    <>
      {loading ? (
        <TableSkeleton ref={ref} />
      ) : rowsMemo.length === 0 ? (
        <EmptyState ref={ref} title="No location data available" description="Location data will appear once there is enough activity." className="py-8" />
      ) : (
        <Scale>
          <Table ref={ref} rows={rowsMemo} header={headerMemo} />
        </Scale>
      )}
    </>
  );
}

export function GeoRankTable(props: {
  id?: number;
  type?: 'stars' | 'participants';
  role?: string;
  className?: string;
  excludeSeenBefore?: boolean;
  handleExcludeSeenBefore?: (excludeSeenBefore?: boolean) => void;
}) {
  const {
    id,
    type = 'stars',
    className,
    role,
    excludeSeenBefore = false,
    handleExcludeSeenBefore,
  } = props;

  if (!id) {
    return null;
  }

  return (
    <div
      className={twMerge(
        'px-1 items-center justify-around flex flex-col',
        className
      )}
    >
      <div className='px-1 text-base font-semibold leading-6 text-white mx-auto w-fit'>
        Top locations
      </div>
      {handleExcludeSeenBefore && (
        <RankTableCheckbox
          id={`location-rank-table-${type}`}
          checked={excludeSeenBefore}
          onChange={handleExcludeSeenBefore}
          label='New companies only'
        />
      )}
      <div className='grow overflow-y-auto styled-scrollbar'>
        <GeoRankTableContent
          id={id}
          type={type}
          role={role}
          excludeSeenBefore={excludeSeenBefore}
        />
      </div>
      <div className='w-full pt-2'>
        <CompletionRateContent
          id={id}
          type={type}
          role={role}
          target='locations'
        />
      </div>
    </div>
  );
}

export function CompanyRankTableContent (props: {
  id: number;
  type: 'stars' | 'participants';
  role?: string;
  maxRows?: number;
  excludeSeenBefore?: boolean;
}) {
  const { id, maxRows = 10, type, role, excludeSeenBefore = false } = props;
  const repoIds = useRepoIds();
  const period = usePeriod();
  const {
    result: data = [],
    ref,
    loading,
  } = usePerformanceOptimizedNetworkRequest(
    getOrgActivityOrgs,
    id, { activity: type, period, ...(role && { role }), repoIds, excludeSeenBefore });

  const rowsMemo = React.useMemo(() => {
    return data
      .slice(0, maxRows)
      .map((d: any, idx: number) => [idx + 1, d.organization_name, d[type]]);
  }, [data, maxRows, type]);

  const headerMemo = React.useMemo(() => {
    return ['No.', 'Company', upperFirst(type)];
  }, [type]);

  return (
    <>
      {loading ? (
        <TableSkeleton ref={ref} />
      ) : rowsMemo.length === 0 ? (
        <EmptyState ref={ref} title="No company data available" description="Company data will appear once there is enough activity." className="py-8" />
      ) : (
        <Scale>
          <Table ref={ref} rows={rowsMemo} header={headerMemo} />
        </Scale>
      )}
    </>
  );
}

export function CompletionRateContent(props: {
  id: number;
  type: 'stars' | 'participants';
  target: 'organizations' | 'locations';
  role?: string;
}) {
  const { id, type, target, role } = props;
  const repoIds = useRepoIds();
  const period = usePeriod();
  const {
    result: data = [],
    ref,
    loading,
  } = usePerformanceOptimizedNetworkRequest(getCompletionRate, id, {
    activity: type,
    period,
    ...(role && { role }),
    target,
    repoIds,
  });

  const percentageMemo = useMemo(() => {
    if (!data?.[0]?.percentage) {
      return undefined;
    }
    return (data?.[0]?.percentage * 100).toFixed(2);
  }, [data]);

  const labelMemo = useMemo(() => {
    if (target === 'locations') {
      return 'Location';
    }
    if (target === 'organizations') {
      return 'Company';
    }
    return undefined;
  }, [target]);

  const tooltipContent = useMemo(() => {
    if (type === 'stars') {
      if (target === 'organizations') {
        return [
          `Completion Rate (%) = (Stargazers with Company Info / Total
          Stargazers) * 100%`,
          `*This analysis is derived from user-provided profile company
          data and is intended for reference.`,
        ];
      }
      if (target === 'locations') {
        return [
          `Completion Rate (%) = (Stargazers with Location Info / Total
          Stargazers) * 100%`,
          `*This analysis is derived from user-provided profile location
          data and is intended for reference.`,
        ];
      }
    }
    if (type === 'participants') {
      if (target === 'organizations') {
        return [
          `Completion Rate (%) = (Contributors with Company Info / Total
          Contributors) * 100%`,
          `*This analysis is derived from user-provided profile company
          data and is intended for reference.`,
        ];
      }
      if (target === 'locations') {
        return [
          `Completion Rate (%) = (Contributors with Location Info / Total
          Contributors) * 100%`,
          `*This analysis is derived from user-provided profile location
          data and is intended for reference.`,
        ];
      }
    }
    return undefined;
  }, [type, target]);

  return (
    <>
      {loading ? (
        <div ref={ref} />
      ) : (
        <Scale>
          {/* <FilledRatio ref={ref} data={percentageMemo} /> */}
          <div ref={ref} className='text-[#7c7c7c] text-xs'>
              {labelMemo} Info Completion:
            <span className='text-[#aaa] font-bold inline-flex gap-2 pl-1'>
              {percentageMemo}%
              {tooltipContent && (
                <Tooltip.InfoTooltip
                  iconProps={{
                    className: 'w-3 h-3',
                  }}
                  contentProps={{
                    className:
                      'text-[12px] leading-[16px] max-w-[400px] bg-[var(--background-color-tooltip)] text-[var(--text-color-tooltip)]',
                  }}
                  arrowProps={{
                    className: 'fill-[var(--background-color-tooltip)]',
                  }}
                >
                  <p className='font-bold'>
                    <span className='relative inline-flex rounded-full h-2 w-2 bg-[#56AEFF] mr-2' />
                    {tooltipContent[0]}
                  </p>
                  <hr className='my-2' />
                  <p className=''>{tooltipContent[1]}</p>
                </Tooltip.InfoTooltip>
              )}
            </span>
          </div>
        </Scale>
      )}
    </>
  );
}


export function CompanyRankTable(props: {
  id?: number;
  type?: 'stars' | 'participants';
  role?: string;
  className?: string;
  excludeSeenBefore?: boolean;
  handleExcludeSeenBefore?: (excludeSeenBefore?: boolean) => void;
}) {
  const {
    id,
    type = 'stars',
    className,
    role,
    excludeSeenBefore = false,
    handleExcludeSeenBefore,
  } = props;

  if (!id) {
    return null;
  }

  return (
    <div
      className={twMerge(
        'px-1 items-center justify-around flex flex-col',
        className
      )}
    >
      <div className='px-1 text-base font-semibold leading-6 text-white mx-auto w-fit'>
        Top companies
      </div>
      {handleExcludeSeenBefore && (
        <RankTableCheckbox
          id={`company-rank-table-${type}`}
          checked={excludeSeenBefore}
          onChange={handleExcludeSeenBefore}
          label='New companies only'
        />
      )}
      <div className='grow overflow-y-auto styled-scrollbar'>
        <CompanyRankTableContent
          id={id}
          type={type}
          role={role}
          excludeSeenBefore={excludeSeenBefore}
        />
      </div>
      <div className='w-full pt-2'>
        <CompletionRateContent
          id={id}
          type={type}
          role={role}
          target='organizations'
        />
      </div>
    </div>
  );
}

function RankTableCheckbox(props: {
  id?: string;
  checked: boolean;
  onChange?: (checked?: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}) {
  const { id, checked, onChange, label, description, disabled, className } =
    props;

  return (
    <div className='relative flex items-start'>
      <div className='w-full flex gap-2'>
        <input
          className='peer relative appearance-none shrink-0 w-4 h-4 mt-1'
          type='checkbox'
          disabled={disabled}
          id={id}
          aria-describedby={`${id}-description`}
          checked={checked}
          readOnly
          onClick={() => {
            onChange && onChange(!checked);
          }}
        />
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 11 11'
          fill='none'
          className='absolute w-4 h-4 pointer-events-none stroke-none fill-none peer-checked:!fill-[var(--color-primary)] peer-checked:!stroke-[var(--color-primary)] mt-1'
        >
          <rect
            x='0.5'
            y='0.5'
            width='10'
            height='10'
            rx='1.5'
            fill='#434247'
            stroke='var(--color-primary)'
          />
          <path d='M9.77778 0H1.22222C0.898069 0 0.587192 0.128769 0.357981 0.357981C0.128769 0.587192 0 0.898069 0 1.22222V9.77778C0 10.1019 0.128769 10.4128 0.357981 10.642C0.587192 10.8712 0.898069 11 1.22222 11H9.77778C10.1019 11 10.4128 10.8712 10.642 10.642C10.8712 10.4128 11 10.1019 11 9.77778V1.22222C11 0.898069 10.8712 0.587192 10.642 0.357981C10.4128 0.128769 10.1019 0 9.77778 0ZM9.77778 1.22222V9.77778H1.22222V1.22222H9.77778ZM4.27778 8.55556L1.83333 6.11111L2.695 5.24333L4.27778 6.82611L8.305 2.79889L9.16667 3.66667' />
        </svg>
        <label htmlFor={id}>{label}</label>
        <span id={`${id}-description`} className='sr-only'>
          <span className='sr-only'>{label}</span>
          {description}
        </span>
      </div>
    </div>
  );
}

function useRepoIds () {
  const usp = useSearchParams();

  return usp.getAll('repoIds');
}

function usePeriod() {
  const usp = useSearchParams();

  return usp.get('period') || 'past_28_days';
}
