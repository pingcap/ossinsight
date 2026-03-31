'use client';
import ChartTemplate from '@/components/Analyze/Section/Chart';
import { ScrollspySectionWrapper } from '@/components/Scrollspy/SectionWrapper';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getWidgetSize } from '@/lib/charts-utils/utils';
import * as React from 'react';

export default function IssueContent () {
  return (
    <ScrollspySectionWrapper anchor="issue" className="pt-8 pb-8">
      <SectionHeading>Issue</SectionHeading>
      <p className="pb-4 text-[16px] leading-7 text-[#7c7c7c]">{`Analyze your organization's issue management practices to gain insights into user feedback, suggestions, and discussions, indirectly revealing valuable product insights and user sentiments. Evaluate issue closure rates, response times, and active discussions to enhance organizational efficiency and collaboration while aligning with user needs for continuous improvement.`}</p>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4">
            <ChartTemplate
              name="@ossinsight/widget-compose-org-productivity-ratio"
              title="Issue Closed Ratio"
              visualizer={() => import('@/charts/analyze/org/activity-action-ratio/visualization')}
              searchParams={{
                activity: 'issues/closed',
              }}
              height={getWidgetSize().widgetWidth(3)}
            />
          </div>
          <div className="col-span-8">
            <ChartTemplate
              name="@ossinsight/widget-analyze-org-activity-efficiency"
              title="Issue Activity Efficiency"
              visualizer={() => import('@/charts/analyze/org/activity-efficiency/visualization')}
              searchParams={{
                activity: 'issues',
              }}
              height={getWidgetSize().widgetWidth(3)}
            />
          </div>
        </div>
      </div>
    </ScrollspySectionWrapper>
  );
}
