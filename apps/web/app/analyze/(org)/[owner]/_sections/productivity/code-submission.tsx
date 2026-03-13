'use client';
import SectionTemplate from '@/components/Analyze/Section';
import ChartTemplate from '@/components/Analyze/Section/Chart';
import { SplitTemplate } from '@/components/Analyze/Section/gridTemplates/SplitTemplate';
import { getWidgetSize } from '@/utils/format';
import * as React from 'react';

function getLocalTimezoneOffset() {
  return Math.round(-new Date().getTimezoneOffset() / 60);
}

export default function CodeSubmissionContent () {
  return (
    <SectionTemplate
      id="code-submission"
      title="Code Submission"
      level={3}
      className="pt-8 flex flex-col gap-4"
    >
      <ChartTemplate
        name='@ossinsight/widget-compose-org-activity-growth-total'
        visualizer={() => import('@/charts/compose/org/activity-growth-total/visualization')}
        searchParams={{
          activity: 'commits',
        }}
        className="w-full"
        height={getWidgetSize().widgetWidth(4)}
      />
      <SplitTemplate>
        <OrgCommitsTimeDistribution />
        <ChartTemplate
          name="@ossinsight/widget-compose-org-code-changes-top-repositories"
          visualizer={() => import('@/charts/compose/org/code-changes-top-repositories/visualization')}
          searchParams={{}}
          height={316}
        />
      </SplitTemplate>
    </SectionTemplate>
  );
}

function OrgCommitsTimeDistribution (props: { className?: string }) {
  const zone = React.useMemo(() => getLocalTimezoneOffset(), []);

  return (
    <div className={props.className}>
      <ChartTemplate
        name="@ossinsight/widget-analyze-org-commits-time-distribution"
        visualizer={() => import('@/charts/analyze/org/commits-time-distribution/visualization')}
        searchParams={{
          zone: `${zone}`,
        }}
        height={316}
      />
    </div>
  );
}
