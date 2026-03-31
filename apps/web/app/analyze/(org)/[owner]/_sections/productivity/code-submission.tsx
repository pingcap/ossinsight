'use client';
import ChartTemplate from '@/components/Analyze/Section/Chart';
import { ScrollspySectionWrapper } from '@/components/Scrollspy/SectionWrapper';
import { getWidgetSize } from '@/lib/charts-utils/utils';
import * as React from 'react';

function getLocalTimezoneOffset() {
  return Math.round(-new Date().getTimezoneOffset() / 60);
}

export default function CodeSubmissionContent () {
  return (
    <ScrollspySectionWrapper anchor="code-submission" className="pt-8 pb-8">
      <h3 className="text-[18px] font-semibold text-[#e9eaee] pb-3" style={{ scrollMarginTop: '140px' }}>Code Submission</h3>
      <div className="flex flex-col gap-4">
        <ChartTemplate
          name='@ossinsight/widget-compose-org-activity-growth-total'
          title='Commit Growth'
          visualizer={() => import('@/charts/analyze/org/recent-stats/visualization')}
          searchParams={{
            activity: 'commits',
          }}
          className="w-full"
          height={getWidgetSize().widgetWidth(4)}
        />
        <OrgCommitsTimeDistribution />
      </div>
    </ScrollspySectionWrapper>
  );
}

function OrgCommitsTimeDistribution (props: { className?: string }) {
  const zone = React.useMemo(() => getLocalTimezoneOffset(), []);

  return (
    <div className="w-1/2">
      <ChartTemplate
        name="@ossinsight/widget-analyze-org-commits-time-distribution"
        title="Commit Time Distribution"
        visualizer={() => import('@/charts/analyze/org/commits-time-distribution/visualization')}
        searchParams={{
          zone: `${zone}`,
        }}
        height={316}
      />
    </div>
  );
}
