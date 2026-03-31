'use client';

import { ScrollspySectionWrapper } from '@/components/Scrollspy/SectionWrapper';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AnalyzeOwnerContext } from '@/components/Context/Analyze/AnalyzeOwner';
import { TextSkeleton } from '@/components/ui/components/Skeleton';
import { GHAvatar } from '@/components/ui/components/GHAvatar';
import { formatNumber, number2percent } from '@/lib/charts-utils/utils';
import NextLink from 'next/link';
import {
  StarIcon,
  GitPullRequestIcon,
  IssueOpenedIcon,
  CodeReviewIcon,
  RepoIcon,
  PersonIcon,
} from '@primer/octicons-react';
import MetricTable from '@/components/ui/MetricTable';
import type { MetricItem } from '@/components/ui/MetricTable';
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
          <GHAvatar
            name={`https://avatars.githubusercontent.com/u/${userId}`}
            size={40}
            rounded={true}
            className="inline mr-[10px]"
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
      <SectionHeading>Overview</SectionHeading>
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
  const items: MetricItem[] = [
    { icon: <StarIcon fill="#FAC858" size={16} />, label: 'Starred Repos', value: formatNumber(overview?.star_repos ?? 0) },
    { icon: <StarIcon fill="#FAC858" size={16} />, label: 'Stars Earned', value: formatNumber(overview?.star_earned ?? 0) },
    { icon: <RepoIcon fill="#6940D0" size={16} />, label: 'Contributed to', value: formatNumber(overview?.contribute_repos ?? 0) },
    { icon: <IssueOpenedIcon fill="#FDE494" size={16} />, label: 'Issues', value: formatNumber(overview?.issues ?? 0) },
    { icon: <GitPullRequestIcon fill="#D34764" size={16} />, label: 'Pull Requests', value: formatNumber(overview?.pull_requests ?? 0) },
    { icon: <CodeReviewIcon fill="#2F92FF" size={16} />, label: 'Code Reviews', value: formatNumber(overview?.code_reviews ?? 0) },
    {
      icon: <GitPullRequestIcon fill="#D34764" size={16} />,
      label: 'PR Code Changes',
      value: (
        <><span className="text-[#57ab5a]">+{formatNumber(overview?.code_additions ?? 0)}</span>{' / '}<span className="text-[#e5534b]">-{formatNumber(overview?.code_deletions ?? 0)}</span></>
      ),
    },
  ];

  return <MetricTable items={items} loading={loading} />;
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
            <span className="text-[#C4C4C4]">{number2percent(lang.percentage)}</span>
          </div>
        ))}
        {othersPercent > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <span className="block w-1.5 h-1.5 rounded-full bg-[#3c3c3c]" />
            <span className="text-[#F9F9F9] font-bold">Others</span>
            <span className="text-[#C4C4C4]">{number2percent(othersPercent)}</span>
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
