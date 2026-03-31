'use client';
import ChartTemplate from '@/components/Analyze/Section/Chart';
import { CompanyRankTable, GeoRankTable } from '@/components/Analyze/Table/RankTable';
import { AnalyzeOwnerContext } from '@/components/Context/Analyze/AnalyzeOwner';
import { ScrollspySectionWrapper } from '@/components/Scrollspy/SectionWrapper';
import { SectionHeading } from '@/components/ui/SectionHeading';
import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { TabBar, TabItem } from '@/components/ui/TabBar';

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
  const [roleKey, setRoleKey] = React.useState<string>(ROLE_TABS[0].key);
  const currentRole = ROLE_TABS.find(t => t.key === roleKey) ?? ROLE_TABS[0];

  const params = useSearchParams();
  const repoIds = params.get('repoIds')?.toString();
  const period = params.get('period')?.toString();

  return (
    <ScrollspySectionWrapper anchor="origins" className="pt-8 pb-8">
      <SectionHeading level="h3">Origins</SectionHeading>

      <TabBar items={ROLE_TABS as unknown as TabItem[]} value={roleKey} onChange={setRoleKey} className="mb-6" />

      <div className="flex flex-col gap-8">
        {/* Company */}
        <div className="grid grid-cols-12 gap-4">
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
              id={orgId}
              type="participants"
              className="h-[405px]"
              role={currentRole.key}
            />
          </div>
        </div>

        {/* Region */}
        <div className="grid grid-cols-12 gap-4">
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
