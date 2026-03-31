'use client';
import ChartTemplate from '@/components/Analyze/Section/Chart';
import { CompanyRankTable, GeoRankTable } from '@/components/Analyze/Table/RankTable';
import { AnalyzeOwnerContext } from '@/components/Context/Analyze/AnalyzeOwner';
import { ScrollspySectionWrapper } from '@/components/Scrollspy/SectionWrapper';
import * as React from 'react';
import { useSearchParams } from 'next/navigation';

const ROLE_TABS = [
  { key: 'pr_creators', label: 'PR Creators' },
  { key: 'pr_reviewers', label: 'PR Reviewers' },
  { key: 'pr_commenters', label: 'PR Commenters' },
  { key: 'issue_creators', label: 'Issue Creators' },
  { key: 'issue_commenters', label: 'Issue Commenters' },
  { key: 'commit_authors', label: 'Commit Authors' },
] as const;

export default function OriginsContent () {
  const { id: orgId } = React.useContext(AnalyzeOwnerContext);
  const [roleIndex, setRoleIndex] = React.useState(0);
  const currentRole = ROLE_TABS[roleIndex];

  const params = useSearchParams();
  const repoIds = params.get('repoIds')?.toString();
  const period = params.get('period')?.toString();

  return (
    <ScrollspySectionWrapper anchor="origins" className="pt-8 pb-8">
      <h3 className="text-[18px] font-semibold text-[#e9eaee] pb-3" style={{ scrollMarginTop: '140px' }}>
        Origins
      </h3>

      <div className="mb-6 flex gap-1 border-b border-[#3a3a3a]">
        {ROLE_TABS.map((tab, i) => (
          <button
            key={tab.key}
            className={`px-4 py-2 text-sm transition-colors ${
              i === roleIndex
                ? 'border-b-2 border-[var(--color-primary)] text-white'
                : 'text-[#8c8c8c] hover:text-[#d8d8d8]'
            }`}
            onClick={() => setRoleIndex(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-8">
        {/* Company */}
        <div className="grid grid-cols-12 gap-4" key={`company-${currentRole.key}`}>
          <div className="col-span-8">
            <ChartTemplate
              title="Activity by Company"
              name="@ossinsight/widget-analyze-org-company"
              visualizer={() => import('@/charts/analyze/org/company/visualization')}
              searchParams={{
                activity: 'participants',
                role: currentRole.key,
              }}
              height={405}
            />
          </div>
          <div className="col-span-4">
            <CompanyRankTable
              key={currentRole.key + repoIds + period}
              id={orgId}
              type="participants"
              className="h-[405px]"
              role={currentRole.key}
            />
          </div>
        </div>

        {/* Region */}
        <div className="grid grid-cols-12 gap-4" key={`map-${currentRole.key}`}>
          <div className="col-span-8">
            <ChartTemplate
              title="Activity by Region"
              name="@ossinsight/widget-analyze-org-activity-map"
              visualizer={() => import('@/charts/analyze/org/activity-map/visualization')}
              searchParams={{
                activity: 'participants',
                role: currentRole.key,
              }}
              height={365}
            />
          </div>
          <div className="col-span-4">
            <GeoRankTable
              key={currentRole.key + repoIds + period}
              id={orgId}
              type="participants"
              role={currentRole.key}
              className="h-[365px]"
            />
          </div>
        </div>
      </div>
    </ScrollspySectionWrapper>
  );
}
