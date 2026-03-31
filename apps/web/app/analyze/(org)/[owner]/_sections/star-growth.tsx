'use client';
import * as React from 'react';

import ChartTemplate from '@/components/Analyze/Section/Chart';
import { AnalyzeOwnerContext } from '@/components/Context/Analyze/AnalyzeOwner';
import {
  CompanyRankTable,
  GeoRankTable,
} from '@/components/Analyze/Table/RankTable';
import { getWidgetSize } from '@/lib/charts-utils/utils';
import { ScrollspySectionWrapper } from '@/components/Scrollspy/SectionWrapper';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useSearchParams } from 'next/navigation';

export default function StarGrowthContent() {
  const { id: orgId } = React.useContext(AnalyzeOwnerContext);

  const params = useSearchParams();
  const repoIds = params.get('repoIds')?.toString() || '';
  const period = params.get('period')?.toString() || '';

  return (
    <section className="pt-8 pb-8">
      <SectionHeading>Popularity</SectionHeading>
      <p className="pb-4 text-[16px] leading-7 text-[#7c7c7c]">Discover the popularity and reach of your repositories through stars, enabling you to gauge the community&apos;s interest and identify potential collaboration opportunities.</p>
      <ScrollspySectionWrapper anchor="star-growth" className="pt-8 pb-8">
        <SectionHeading level="h3" className="text-[22px]">Star Growth</SectionHeading>
        <div className="flex flex-col gap-4">
          <ChartTemplate
            name='@ossinsight/widget-analyze-org-recent-stats'
            title='Star Growth'
            visualizer={() => import('@/charts/analyze/org/recent-stats/visualization')}
            searchParams={{
              activity: 'stars',
            }}
            height={getWidgetSize().widgetWidth(4)}
          />

          <SectionHeading level="h3" className="text-[22px] pt-4">Stars by Company</SectionHeading>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8">
              <ChartTemplate
                name='@ossinsight/widget-analyze-org-company'
                title='Stars by Company'
                visualizer={() => import('@/charts/analyze/org/company/visualization')}
                searchParams={{
                  activity: 'stars',
                  role: 'stars',
                }}
                height={405}
              />
            </div>
            <div className="col-span-4">
              <CompanyRankTable
                id={orgId}
                type='stars'
                role='stars'
                className={`h-[405px]`}
              />
            </div>
          </div>

          <SectionHeading level="h3" className="text-[22px] pt-4">Stars Activity Map</SectionHeading>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8">
              <ChartTemplate
                name='@ossinsight/widget-analyze-org-activity-map'
                title='Stars Activity Map'
                visualizer={() => import('@/charts/analyze/org/activity-map/visualization')}
                searchParams={{
                  activity: 'stars',
                  role: 'stars'
                }}
                height={365}
              />
            </div>
            <div className="col-span-4">
              <GeoRankTable
                id={orgId}
                type='stars'
                role='stars'
                className={`h-[365px]`}
              />
            </div>
          </div>
        </div>
      </ScrollspySectionWrapper>
    </section>
  );
}
