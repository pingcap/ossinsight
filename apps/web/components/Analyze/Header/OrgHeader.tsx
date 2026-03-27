'use client';
import { TextSkeleton } from '@/components/ui/components/Skeleton';
import * as React from 'react';
import NextImage from 'next/image';
import {
  RepoIcon,
  StarIcon,
  PeopleIcon,
  OrganizationIcon,
} from '@primer/octicons-react';
import NextLink from 'next/link';

import {
  AnalyzeOwnerContext,
} from '@/components/Context/Analyze/AnalyzeOwner';
import * as Tooltip from '@/components/ui/components/Tooltip';
import { twMerge } from 'tailwind-merge';
import { formatNumber } from '@/utils/format';

import { useOrgOverview } from '@/components/Analyze/hooks';
import OrgAnalyzePageHeaderAction from '@/components/Analyze/Header/OrgHeaderAction';

export default function OrgAnalyzePageHeader() {
  const { name: orgName, id: orgId, bio, public_repos, login } =
    React.useContext(AnalyzeOwnerContext);

  const { data, loading } = useOrgOverview(orgId);

  return (
    <>
      {/* -- header -- */}
      <OrgTitleIconEle
        id={orgId}
        name={orgName}
        wrapper='h1'
        login={login}
      />
      {bio && <p className='my-4 text-[#8c8c8c]'>{bio}</p>}

      {/* -- status bar -- */}
      <div className='flex gap-6 flex-wrap flex-col md:flex-row md:items-end'>
        <LabelItemWithCount
          label='Public repositories'
          loading={false}
          count={public_repos || 0}
          icon={<RepoIcon />}
        />
        <LabelItemWithCount
          label='Participants'
          loading={loading}
          count={data?.participants || 0}
          icon={<PeopleIcon />}
          description='Includes individuals involved in code contributions, code reviews, report issues, issue/pull request discussions within all public repositories of the organization.'
        />
        <LabelItemWithCount
          label='Stars earned'
          loading={loading}
          count={data?.stars || 0}
          icon={<StarIcon />}
        />
        {(loading || data?.last_event_at) && (
          <div className='ml-auto inline-flex gap-2 items-center'>
            <span className='flex h-3 w-3 relative'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fbe593] opacity-35'></span>
              <span className='relative inline-flex rounded-full h-3 w-3 bg-[#fbe593]'></span>
            </span>
            <span className='text-[#8c8c8c]'>Last active at</span>
            {loading && <TextSkeleton characters={4} className='text-title' />}
            {!loading && data?.last_event_at && (
              <span className='text-title'>{`${beautifySeconds(
                calcDateDiff(new Date(data.last_event_at))
              )} ago`}</span>
            )}
          </div>
        )}
      </div>

      {/* -- divider -- */}
      <hr id='title-divider' className='my-1 h-[1px] border-t-0 bg-[#363638]' />

      {/* -- action bar -- */}
      <OrgAnalyzePageHeaderAction />
    </>
  );
}

const H1 = (props: any) => <h1 {...props} />;
const Div = (props: any) => <div {...props} />;
const getWrapper = (type: string) => {
  switch (type) {
    case 'div':
      return Div;
    case 'h1':
      return H1;
    default:
      return Div;
  }
};

export function OrgTitleIconEle(props: {
  wrapperClassName?: string;
  labelClassName?: string;
  iconClassName?: string;
  iconSize?: number;
  wrapper?: 'div' | 'h1';
  id: string | number;
  name: string;
  login: string;
}) {
  const {
    wrapperClassName,
    labelClassName,
    iconClassName,
    wrapper = 'div',
    iconSize = 40,
    id,
    name,
    login,
  } = props;

  const WrapperMemo = React.useMemo(() => getWrapper(wrapper), [wrapper]);

  return (
    <NextLink target='_blank' rel='noopener noreferrer' href={`https://github.com/${login}`}>
      <WrapperMemo
        className={twMerge(
          'font-semibold text-3xl text-title inline-flex items-center cursor-pointer',
          wrapperClassName
        )}
      >
        <NextImage
          src={`https://avatars.githubusercontent.com/u/${id}`}
          alt={`${name} logo`}
          className={twMerge('inline mr-[10px]', iconClassName)}
          width={iconSize}
          height={iconSize}
        />
        {name}
        <span
          className={twMerge(
            'bg-[#2e2e2f] text-[#fbe593] text-xs font-medium border border-solid border-[#5a5642] ml-4 px-2.5 py-1.5 rounded-full inline-flex items-center gap-2',
            labelClassName
          )}
        >
          <OrganizationIcon size={8} />
          Organization
        </span>
      </WrapperMemo>
    </NextLink>
  );
}

const LabelItemWithCount = ({
  label,
  count,
  icon,
  description,
  loading = true,
}: {
  label: string;
  count: number;
  icon?: React.ReactNode;
  description?: string;
  loading?: boolean;
}) => {
  return (
    <div className='flex gap-2 items-center cursor-default text-[#b6b6b6]'>
      {icon && <div className='text-[#8c8c8c]'>{icon}</div>}
      {!loading && <div className='text-title'>{formatNumber(count)}</div>}
      {loading && <TextSkeleton characters={2} className='text-title' />}
      <div className='inline-flex items-center'>
        {label}
        {description && (
          <Tooltip.InfoTooltip
            iconProps={{
              className: 'inline ml-1',
              width: 12,
              height: 12,
            }}
            contentProps={{
              className: 'text-[12px] leading-[16px] max-w-[400px] bg-[var(--background-color-tooltip)] text-[var(--text-color-tooltip)]',
            }}
            arrowProps={{
              className: 'fill-[var(--background-color-tooltip)]',
            }}
          >
            {description}
          </Tooltip.InfoTooltip>
        )}
      </div>
    </div>
  );
};

const calcDateDiff = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return diff / 1000;
};

const beautifySeconds = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days.toFixed(0)} days`;
  } else if (hours > 0) {
    return `${hours.toFixed(0)} hours`;
  } else if (minutes > 0) {
    return `${minutes.toFixed(0)} minutes`;
  } else {
    return `${seconds.toFixed(0)} seconds`;
  }
};
