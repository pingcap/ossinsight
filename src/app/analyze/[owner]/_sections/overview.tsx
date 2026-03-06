'use client';
import SectionTemplate from '@/components/Analyze/Section';
import ChartTemplate from '@/components/Analyze/Section/Chart';
import { getWidgetSize } from '@/lib/widgets-utils/utils';

export default function OverviewContent () {
  return (
    <SectionTemplate
      id="overview"
      title="Organization Overview"
      level={2}
      className="pt-8"
    >
      <div className="sm:grid space-y-4 md:space-y-0 grid-cols-6 grid-rows-4 lg:grid-cols-12 lg:grid-rows-2 gap-4 overflow-hidden">
        <ChartTemplate
          name="@ossinsight/widget-compose-org-overview-stars"
          className="w-auto col-span-6 row-start-1"
          height={getWidgetSize().widgetWidth(2)}
          innerSectionId="star-growth"
        />
        <ChartTemplate
          name="@ossinsight/widget-compose-org-overview-stats"
          searchParams={{
            activity: 'pull-requests',
          }}
          className="w-auto col-span-2 col-start-1 row-start-2"
          height={getWidgetSize().widgetWidth(2)}
          innerSectionId="pull-request-efficiency"
        />
        <ChartTemplate
          name="@ossinsight/widget-compose-org-overview-stats"
          searchParams={{
            activity: 'reviews',
          }}
          className="w-auto col-span-2 row-start-2"
          height={getWidgetSize().widgetWidth(2)}
          innerSectionId="code-review-efficiency"
        />
        <ChartTemplate
          name="@ossinsight/widget-compose-org-overview-stats"
          searchParams={{
            activity: 'issues',
          }}
          className="w-auto col-span-2 row-start-2"
          height={getWidgetSize().widgetWidth(2)}
          innerSectionId="issue"
        />
        <ChartTemplate
          name="@ossinsight/widget-compose-org-active-contributors"
          searchParams={{
            activity: 'active',
          }}
          className="w-auto col-span-3 col-start-1 lg:col-start-7 row-start-3 lg:row-start-1"
          height={getWidgetSize().widgetWidth(2)}
          innerSectionId="engagement"
        />
        <ChartTemplate
          name="@ossinsight/widget-compose-org-active-contributors"
          searchParams={{
            activity: 'new',
          }}
          className="w-auto col-span-3 col-start-1 lg:col-start-7 row-start-4 lg:row-start-2"
          height={getWidgetSize().widgetWidth(2)}
          innerSectionId="engagement"
        />
        <ChartTemplate
          name="@ossinsight/widget-compose-org-activity-active-ranking"
          searchParams={{
            activity: 'repos',
          }}
          className="w-auto col-span-3 col-start-4 lg:col-start-10 row-span-2 row-start-3 lg:row-start-1"
          height={getWidgetSize().widgetWidth(4)}
        />
      </div>
    </SectionTemplate>
  );
}
