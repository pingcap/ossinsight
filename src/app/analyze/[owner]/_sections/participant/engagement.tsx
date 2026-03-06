'use client';
import SectionTemplate from '@/components/Analyze/Section';
import ChartTemplate from '@/components/Analyze/Section/Chart';
import { MainSideGridTemplate } from '@/components/Analyze/Section/gridTemplates/MainSideGridTemplate';
import { SplitTemplate } from '@/components/Analyze/Section/gridTemplates/SplitTemplate';
import { getWidgetSize } from '@/lib/widgets-utils/utils';
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
          searchParams={{
            activity: 'active',
          }}
          height={getWidgetSize().widgetWidth(4)}
        />
        <ChartTemplate
          name="@ossinsight/widget-compose-org-activity-active-ranking"
          searchParams={{
            activity: 'participants',
          }}
          height={getWidgetSize().widgetWidth(4)}
        />
      </MainSideGridTemplate>
      <MainSideGridTemplate>
        <ChartTemplate
          name="@ossinsight/widget-compose-org-participants-growth"
          searchParams={{
            activity: 'new',
          }}
          height={getWidgetSize().widgetWidth(4)}
        />
        <ChartTemplate
          name="@ossinsight/widget-compose-org-activity-new-ranking"
          searchParams={{
            activity: 'participants',
          }}
          height={getWidgetSize().widgetWidth(4)}
        />
      </MainSideGridTemplate>
      <SplitTemplate>
        <ChartTemplate
          name="@ossinsight/widget-compose-org-participants-roles-ratio"
          className="w-full"
          searchParams={{}}
          height={getWidgetSize().widgetWidth(5)}
        />
        <ChartTemplate
          name="@ossinsight/widget-compose-org-engagement-scatter"
          className="w-full"
          searchParams={{}}
          height={getWidgetSize().widgetWidth(5)}
        />
      </SplitTemplate>
    </SectionTemplate>
  );
}
