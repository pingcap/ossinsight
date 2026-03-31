'use client';

import { ScrollspySectionWrapper } from '@/components/Scrollspy/SectionWrapper';
import { AnalyzeOwnerContext } from '@/components/Context/Analyze/AnalyzeOwner';
import { TextSkeleton } from '@/components/ui/components/Skeleton';
import { formatNumber } from '@/lib/charts-utils/utils';
import NextImage from 'next/image';
import NextLink from 'next/link';
import {
  StarIcon,
  GitPullRequestIcon,
  IssueOpenedIcon,
  CodeReviewIcon,
  RepoIcon,
  PersonIcon,
} from '@primer/octicons-react';
import * as React from 'react';
import { useMemo } from 'react';
import PersonalChart from '../_charts/ChartWrapper';
import { chartColors, languageColors } from '../_charts/colors';
import { contributionTypes, usePersonalData, usePersonalOverview } from '../_hooks/usePersonal';

export default function OverviewSection () {
  const { login, id: userId, bio } = React.useContext(AnalyzeOwnerContext);
  const { data: overview, loading } = usePersonalOverview(userId);

  return (
    <ScrollspySectionWrapper anchor="overview">
      {/* -- header -- */}
      <NextLink target="_blank" rel="noopener noreferrer" href={`https://github.com/${login}`}>
        <h1 className="font-semibold text-[28px] text-title inline-flex items-center cursor-pointer">
          <NextImage
            src={`https://avatars.githubusercontent.com/u/${userId}`}
            alt={`${login} avatar`}
            className="inline mr-[10px] rounded-full"
            width={40}
            height={40}
          />
          {login}
        </h1>
      </NextLink>
      {bio && <p className="my-4 text-[#8c8c8c]">{bio}</p>}

      {/* -- status bar -- */}
      <div className="flex gap-6 flex-wrap flex-col md:flex-row md:items-end">
        <LabelItem icon={<StarIcon />} label="Starred repos" count={overview?.star_repos} loading={loading} />
        <LabelItem icon={<StarIcon />} label="Stars earned" count={overview?.star_earned} loading={loading} />
        <LabelItem icon={<RepoIcon />} label="Contributed to" count={overview?.contribute_repos} loading={loading} />
        <LabelItem icon={<GitPullRequestIcon />} label="Pull requests" count={overview?.pull_requests} loading={loading} />
        <LabelItem icon={<IssueOpenedIcon />} label="Issues" count={overview?.issues} loading={loading} />
        <LabelItem icon={<CodeReviewIcon />} label="Code reviews" count={overview?.code_reviews} loading={loading} />
      </div>

      {/* -- divider -- */}
      <hr className="my-1 h-[1px] border-t-0 bg-[#363638]" />

      {/* -- Overview section -- */}
      <h2 className="text-[22px] font-semibold text-[#e9eaee] pb-4" style={{ scrollMarginTop: '140px' }}>Overview</h2>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 items-start">
        <div>
          <h4 className="text-[14px] font-medium text-[#e9eaee] pb-2">Metrics</h4>
          <OverviewTable overview={overview} loading={loading} />
          <Languages userId={userId} />
        </div>
        <div>
          <ContributionTrends userId={userId} />
        </div>
      </div>
    </ScrollspySectionWrapper>
  );
}

function LabelItem ({ icon, label, count, loading }: { icon: React.ReactNode; label: string; count?: number; loading: boolean }) {
  return (
    <div className="flex gap-2 items-center cursor-default text-[#b6b6b6]">
      <div className="text-[#8c8c8c]">{icon}</div>
      {loading ? <TextSkeleton characters={2} className="text-title" /> : <div className="text-title">{formatNumber(count ?? 0)}</div>}
      <div>{label}</div>
    </div>
  );
}

function OverviewTable ({ overview, loading }: { overview: ReturnType<typeof usePersonalOverview>['data']; loading: boolean }) {
  const items = [
    { icon: <StarIcon fill="#FAC858" size={16} />, label: 'Starred Repos', value: overview?.star_repos },
    { icon: <StarIcon fill="#FAC858" size={16} />, label: 'Stars Earned', value: overview?.star_earned },
    { icon: <RepoIcon fill="#6940D0" size={16} />, label: 'Contributed to', value: overview?.contribute_repos },
    { icon: <IssueOpenedIcon fill="#FDE494" size={16} />, label: 'Issues', value: overview?.issues },
    { icon: <GitPullRequestIcon fill="#D34764" size={16} />, label: 'Pull Requests', value: overview?.pull_requests },
    { icon: <CodeReviewIcon fill="#2F92FF" size={16} />, label: 'Code Reviews', value: overview?.code_reviews },
  ];

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-[#323234]">
          <th className="pb-2 text-left text-[13px] font-medium text-[#d8d8d8]" />
          <th className="pb-2 text-right text-[13px] font-medium text-[#d8d8d8]" />
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.label} className="border-b border-[#2a2a2c] last:border-0">
            <td className="py-3 pr-4 text-[14px] text-[#d8d8d8]">
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex h-4 w-4 items-center justify-center">{item.icon}</span>
                <span>{item.label}</span>
              </span>
            </td>
            <td className="py-3 text-right text-[15px] font-medium leading-none text-[#e9eaee] tabular-nums">
              {loading ? (
                <span className="inline-block h-5 w-12 animate-pulse rounded bg-[#343436]" />
              ) : (
                formatNumber(item.value ?? 0)
              )}
            </td>
          </tr>
        ))}
        <tr className="border-b border-[#2a2a2c] last:border-0">
          <td className="py-3 pr-4 text-[14px] text-[#d8d8d8]">
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex h-4 w-4 items-center justify-center"><GitPullRequestIcon fill="#D34764" size={16} /></span>
              <span>PR Code Changes</span>
            </span>
          </td>
          <td className="py-3 text-right text-[15px] font-medium leading-none tabular-nums">
            {loading ? (
              <span className="inline-block h-5 w-20 animate-pulse rounded bg-[#343436]" />
            ) : (
              <><span className="text-[#57ab5a]">+{formatNumber(overview?.code_additions ?? 0)}</span>{' / '}<span className="text-[#e5534b]">-{formatNumber(overview?.code_deletions ?? 0)}</span></>
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function Languages ({ userId }: { userId: number }) {
  const { data, loading } = usePersonalData('personal-languages', userId);
  if (loading || !data || data.length === 0) return null;
  const top4 = data.slice(0, 4);
  const othersPercent = data.slice(4).reduce((sum, l) => sum + l.percentage, 0);

  return (
    <div className="mt-6">
      <h3 className="text-[18px] font-semibold text-[#e9eaee] mb-2">Most Used Languages</h3>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-[#3c3c3c]">
        {top4.map((lang, i) => <div key={lang.language} style={{ width: `${lang.percentage * 100}%`, backgroundColor: languageColors[i % languageColors.length] }} />)}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
        {top4.map((lang, i) => (
          <div key={lang.language} className="flex items-center gap-1.5 text-sm">
            <span className="block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: languageColors[i % languageColors.length] }} />
            <span className="text-[#F9F9F9] font-bold">{lang.language}</span>
            <span className="text-[#C4C4C4]">{lang.percentage === 1 ? '100' : (lang.percentage * 100).toPrecision(2)}%</span>
          </div>
        ))}
        {othersPercent > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <span className="block w-1.5 h-1.5 rounded-full bg-[#3c3c3c]" />
            <span className="text-[#F9F9F9] font-bold">Others</span>
            <span className="text-[#C4C4C4]">{(othersPercent * 100).toPrecision(2)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ContributionTrends ({ userId }: { userId: number }) {
  const { data, sql, queryName, loading } = usePersonalData('personal-contribution-trends', userId);

  const option = useMemo(() => {
    if (!data || data.length === 0) return {};
    const grouped = new Map<string, Array<[string, number]>>();
    for (const row of data) {
      if (!grouped.has(row.contribution_type)) grouped.set(row.contribution_type, []);
      grouped.get(row.contribution_type)!.push([row.event_month, row.cnt]);
    }
    return {
      xAxis: { type: 'time' as const },
      yAxis: { type: 'value' as const },
      series: contributionTypes
        .filter(ct => grouped.has(ct))
        .map((ct, i) => ({
          type: 'line' as const,
          name: ct,
          data: grouped.get(ct),
          symbolSize: 0,
          lineStyle: { width: 1 },
          areaStyle: { opacity: 0.15 },
          color: chartColors[i % chartColors.length],
        })),
    };
  }, [data]);

  const queryParams = useMemo(() => ({ userId }), [userId]);

  return <PersonalChart title="Contribution Trends" option={option} loading={loading} noData={!loading && (!data || data.length === 0)} sql={sql} queryName={queryName} queryParams={queryParams} />;
}
