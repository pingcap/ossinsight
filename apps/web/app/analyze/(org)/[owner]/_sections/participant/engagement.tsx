'use client';
import SectionTemplate from '@/components/Analyze/Section';
import ChartTemplate from '@/components/Analyze/Section/Chart';
import { MainSideGridTemplate } from '@/components/Analyze/Section/gridTemplates/MainSideGridTemplate';
import { SplitTemplate } from '@/components/Analyze/Section/gridTemplates/SplitTemplate';
import { getWidgetSize } from '@/utils/format';
import * as React from 'react';

export default function EngagementContent () {
  return (
    <SectionTemplate
      id="engagement"
      title="Engagement"
      level={3}
      className="pt-8 flex flex-col gap-4"
    >
      <MainSideGridTemplate>
        <ChartTemplate
          name="@ossinsight/widget-compose-org-participants-growth"
          visualizer={() => import('@/charts/compose/org/participants-growth/visualization')}
          searchParams={{
            activity: 'active',
          }}
          height={getWidgetSize().widgetWidth(4)}
        />
        <ChartTemplate
          name="@ossinsight/widget-compose-org-activity-active-ranking"
          visualizer={() => import('@/charts/compose/org/activity-active-ranking/visualization')}
          searchParams={{
            activity: 'participants',
          }}
          height={getWidgetSize().widgetWidth(4)}
        />
      </MainSideGridTemplate>
      <MainSideGridTemplate>
        <ChartTemplate
          name="@ossinsight/widget-compose-org-participants-growth"
          visualizer={() => import('@/charts/compose/org/participants-growth/visualization')}
          searchParams={{
            activity: 'new',
          }}
          height={getWidgetSize().widgetWidth(4)}
        />
        <ChartTemplate
          name="@ossinsight/widget-compose-org-activity-new-ranking"
          visualizer={() => import('@/charts/compose/org/activity-new-ranking/visualization')}
          searchParams={{
            activity: 'participants',
          }}
          height={getWidgetSize().widgetWidth(4)}
        />
      </MainSideGridTemplate>
      <SplitTemplate>
        <ChartTemplate
          name="@ossinsight/widget-compose-org-participants-roles-ratio"
          visualizer={() => import('@/charts/compose/org/participants-roles-ratio/visualization')}
          className="w-full"
          searchParams={{}}
          height={getWidgetSize().widgetWidth(5)}
        />
        <ChartTemplate
          name="@ossinsight/widget-compose-org-engagement-scatter"
          visualizer={() => import('@/charts/compose/org/engagement-scatter/visualization')}
          className="w-full"
          searchParams={{}}
          height={getWidgetSize().widgetWidth(5)}
        />
      </SplitTemplate>
    </SectionTemplate>
  );
}
