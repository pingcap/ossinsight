'use client';

import SectionTemplate from '@/components/Analyze/Section';
import { AnalyzeOwnerContext } from '@/components/Context/Analyze/AnalyzeOwner';
import { TextSkeleton } from '@/components/ui/components/Skeleton';
import { formatNumber } from '@/utils/format';
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
    <>
      {/* -- header -- */}
      <NextLink target="_blank" rel="noopener noreferrer" href={`https://github.com/${login}`}>
        <h1 className="font-semibold text-3xl text-title inline-flex items-center cursor-pointer">
          <NextImage
            src={`https://avatars.githubusercontent.com/u/${userId}`}
            alt={`${login} avatar`}
            className="inline mr-[10px] rounded-full"
            width={40}
            height={40}
          />
          {login}
          <span className="bg-[#2e2e2f] text-[#fbe593] text-xs font-medium border border-solid border-[#5a5642] ml-4 px-2.5 py-1.5 rounded-full inline-flex items-center gap-2">
            <PersonIcon size={8} />
            Developer
          </span>
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
      <SectionTemplate id="overview" title="Overview" level={2}>
        <div className="text-sm text-[#8c8c8c] mb-4">
          All results are calculated only by developer&apos;s <b>public activities</b> showed on GitHub.
          See details in <a href="https://gharchive.org" target="_blank" rel="noopener noreferrer" className="text-[#fbe593] hover:underline">gharchive</a>!
        </div>
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 min-w-0">
            <OverviewTable overview={overview} loading={loading} />
            <Languages userId={userId} />
          </div>
          <div className="flex-1 w-full min-w-0">
            <ContributionTrends userId={userId} />
          </div>
        </div>
      </SectionTemplate>
    </>
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
  const Val = ({ value }: { value?: number | string }) =>
    loading ? <TextSkeleton characters={3} className="text-title" /> : <b className="text-title">{value ?? 0}</b>;

  return (
    <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
      <tbody>
        <tr><td className="py-1.5 text-[#C4C4C4]"><span className="text-[#FF9D36] mr-1">&#9733;</span> Starred Repos</td><td className="py-1.5"><Val value={overview?.star_repos} /></td><td className="py-1.5 text-[#C4C4C4]"><span className="text-[#FF9D36] mr-1">&#9733;</span> Star Earned</td><td className="py-1.5"><Val value={overview?.star_earned} /></td></tr>
        <tr><td className="py-1.5 text-[#C4C4C4]"><span className="text-[#6940D0] mr-1">&#9632;</span> Contributed to</td><td className="py-1.5"><Val value={overview?.contribute_repos} /></td><td className="py-1.5 text-[#C4C4C4]"><span className="text-[#FDE494] mr-1">&#9679;</span> Issues</td><td className="py-1.5"><Val value={overview?.issues} /></td></tr>
        <tr><td className="py-1.5 text-[#C4C4C4]"><span className="text-[#D34764] mr-1">&#10227;</span> Pull Requests</td><td className="py-1.5"><Val value={overview?.pull_requests} /></td><td className="py-1.5 text-[#C4C4C4]"><span className="text-[#2F92FF] mr-1">&#128269;</span> Code Reviews</td><td className="py-1.5"><Val value={overview?.code_reviews} /></td></tr>
        <tr>
          <td className="py-1.5 text-[#C4C4C4]"><span className="text-[#D34764] mr-1">&#10227;</span> PR Code Changes</td>
          <td className="py-1.5" colSpan={3}>
            {loading ? <TextSkeleton characters={6} className="text-title" /> : (
              <b className="text-title"><span className="text-[#57ab5a]">+{formatNumber(overview?.code_additions ?? 0)}</span>{' / '}<span className="text-[#e5534b]">-{formatNumber(overview?.code_deletions ?? 0)}</span></b>
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
      <h3 className="text-lg font-semibold text-title mb-2">Most Used Languages</h3>
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
  const { data, loading } = usePersonalData('personal-contribution-trends', userId);

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

  return <PersonalChart title="Contribution Trends" option={option} loading={loading} noData={!loading && (!data || data.length === 0)} />;
}
