'use client';
import SectionTemplate from '@/components/Analyze/Section';
import ChartTemplate from '@/components/Analyze/Section/Chart';
import { MainSideGridTemplate } from '@/components/Analyze/Section/gridTemplates/MainSideGridTemplate';
import { SplitTemplate } from '@/components/Analyze/Section/gridTemplates/SplitTemplate';
import { getWidgetSize } from '@/utils/format';
import * as React from 'react';

export default function IssueContent () {
  return (
    <SectionTemplate
      id="issue"
      title="Issue"
      description={`Analyze your organization's issue management practices to gain insights into user feedback, suggestions, and discussions, indirectly revealing valuable product insights and user sentiments. Evaluate issue closure rates, response times, and active discussions to enhance organizational efficiency and collaboration while aligning with user needs for continuous improvement.`}
      level={2}
      className="pt-8 flex flex-col gap-4"
    >
      <MainSideGridTemplate inverse>
        <ChartTemplate
          name="@ossinsight/widget-compose-org-productivity-ratio"
          visualizer={() => import('@/charts/compose/org/productivity-ratio/visualization')}
          searchParams={{
            activity: 'issues/closed',
          }}
          height={getWidgetSize().widgetWidth(3)}
        />
        <ChartTemplate
          name="@ossinsight/widget-analyze-org-activity-efficiency"
          visualizer={() => import('@/charts/analyze/org/activity-efficiency/visualization')}
          searchParams={{
            activity: 'issues',
          }}
          height={getWidgetSize().widgetWidth(3)}
        />
      </MainSideGridTemplate>
      <SplitTemplate>
        <ChartTemplate
          name="@ossinsight/widget-compose-org-activity-open-to-close"
          visualizer={() => import('@/charts/compose/org/activity-open-to-close/visualization')}
          searchParams={{
            activity: 'issues',
          }}
          height={274}
        />
        <ChartTemplate
          name="@ossinsight/widget-compose-org-activity-open-to-first-response"
          visualizer={() => import('@/charts/compose/org/activity-open-to-first-response/visualization')}
          searchParams={{
            activity: 'issues',
          }}
          height={274}
        />
      </SplitTemplate>
      <ChartTemplate
        name="@ossinsight/widget-analyze-org-activity-action-top-repos"
        visualizer={() => import('@/charts/analyze/org/activity-action-top-repos/visualization')}
        searchParams={{
          activity: 'issues/issue-comments',
        }}
        height={274}
      />
    </SectionTemplate>
  );
}
