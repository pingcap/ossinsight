'use client';
import SectionTemplate from '@/components/Analyze/Section';
import ChartTemplate from '@/components/Analyze/Section/Chart';
import { getWidgetSize } from '@/utils/format';

export default function OverviewContent () {
  return (
    <SectionTemplate
      id="overview"
      title="Organization Overview"
      level={2}
      className="pt-8"
    >
      <div className="grid grid-cols-12 gap-4">
        <ChartTemplate
          name="@ossinsight/widget-compose-org-overview-stars"
          visualizer={() => import('@/charts/compose/org/overview-stars/visualization')}
          className="col-span-12 lg:col-span-6"
          height={getWidgetSize().widgetWidth(2)}
          innerSectionId="star-growth"
        />
        <ChartTemplate
          name="@ossinsight/widget-compose-org-active-contributors"
          visualizer={() => import('@/charts/compose/org/active-contributors/visualization')}
          searchParams={{
            activity: 'active',
          }}
          className="col-span-6 lg:col-span-3"
          height={getWidgetSize().widgetWidth(2)}
          innerSectionId="engagement"
        />
        <ChartTemplate
          name="@ossinsight/widget-compose-org-activity-active-ranking"
          visualizer={() => import('@/charts/compose/org/activity-active-ranking/visualization')}
          searchParams={{
            activity: 'repos',
          }}
          className="col-span-6 lg:col-span-3 row-span-2"
          height={getWidgetSize().widgetWidth(4)}
        />
        <ChartTemplate
          name="@ossinsight/widget-compose-org-overview-stats"
          visualizer={() => import('@/charts/compose/org/overview-stats/visualization')}
          searchParams={{
            activity: 'pull-requests',
          }}
          className="col-span-4 lg:col-span-2"
          height={getWidgetSize().widgetWidth(2)}
          innerSectionId="pull-request-efficiency"
        />
        <ChartTemplate
          name="@ossinsight/widget-compose-org-overview-stats"
          visualizer={() => import('@/charts/compose/org/overview-stats/visualization')}
          searchParams={{
            activity: 'reviews',
          }}
          className="col-span-4 lg:col-span-2"
          height={getWidgetSize().widgetWidth(2)}
          innerSectionId="code-review-efficiency"
        />
        <ChartTemplate
          name="@ossinsight/widget-compose-org-overview-stats"
          visualizer={() => import('@/charts/compose/org/overview-stats/visualization')}
          searchParams={{
            activity: 'issues',
          }}
          className="col-span-4 lg:col-span-2"
          height={getWidgetSize().widgetWidth(2)}
          innerSectionId="issue"
        />
        <ChartTemplate
          name="@ossinsight/widget-compose-org-active-contributors"
          visualizer={() => import('@/charts/compose/org/active-contributors/visualization')}
          searchParams={{
            activity: 'new',
          }}
          className="col-span-6 lg:col-span-3"
          height={getWidgetSize().widgetWidth(2)}
          innerSectionId="engagement"
        />
      </div>
    </SectionTemplate>
  );
}
