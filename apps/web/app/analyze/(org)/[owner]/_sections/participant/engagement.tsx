'use client';
import ChartTemplate from '@/components/Analyze/Section/Chart';
import { getWidgetSize } from '@/lib/charts-utils/utils';
import { ScrollspySectionWrapper } from '@/components/Scrollspy/SectionWrapper';
import { SectionHeading } from '@/components/ui/SectionHeading';
import * as React from 'react';

export default function EngagementContent () {
  return (
    <ScrollspySectionWrapper anchor="engagement" className="pt-8 pb-8">
      <SectionHeading level="h3">Engagement</SectionHeading>
      <p className="pb-4 text-[16px] leading-7 text-[#7c7c7c]">
        Track participant growth, engagement patterns, and community health over time.
      </p>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <ChartTemplate
            name="@ossinsight/widget-compose-org-participants-growth"
            title="Active Participants"
            visualizer={() => import('@/charts/analyze/org/recent-stats/visualization')}
            searchParams={{
              activity: 'active',
            }}
            className="w-full"
            height={getWidgetSize().widgetWidth(4)}
          />
          <ChartTemplate
            name="@ossinsight/widget-compose-org-participants-growth"
            title="New Participants"
            visualizer={() => import('@/charts/analyze/org/recent-stats/visualization')}
            searchParams={{
              activity: 'new',
            }}
            className="w-full"
            height={getWidgetSize().widgetWidth(4)}
          />
        </div>


        <ChartTemplate
          name="@ossinsight/widget-analyze-org-engagement-scatter"
          title="Engagement Scatter"
          visualizer={() => import('@/charts/analyze/org/engagement-scatter/visualization')}
          searchParams={{}}
          height={getWidgetSize().widgetWidth(5)}
        />
      </div>
    </ScrollspySectionWrapper>
  );
}
