'use client';
import SectionTemplate from '@/components/Analyze/Section';
import ChartTemplate from '@/components/Analyze/Section/Chart';
import { MainSideGridTemplate } from '@/components/Analyze/Section/gridTemplates/MainSideGridTemplate';
import { SplitTemplate } from '@/components/Analyze/Section/gridTemplates/SplitTemplate';
import { getWidgetSize } from '@/utils/format';

export default function CodeReviewEfficiencyContent() {
  return (
    <SectionTemplate
      id="code-review-efficiency"
      title="Code Review"
      level={3}
      className="pt-8 flex flex-col gap-4"
    >
      <MainSideGridTemplate inverse>
        <ChartTemplate
          name="@ossinsight/widget-compose-org-productivity-ratio"
          visualizer={() => import('@/charts/compose/org/productivity-ratio/visualization')}
          searchParams={{
            activity: 'reviews/reviewed',
          }}
          height={getWidgetSize().widgetWidth(3)}
        />
        <ChartTemplate
          name="@ossinsight/widget-analyze-org-recent-pr-review-stats"
          visualizer={() => import('@/charts/analyze/org/recent-pr-review-stats/visualization')}
          searchParams={{}}
          height={getWidgetSize().widgetWidth(3)}
        />
      </MainSideGridTemplate>
      <SplitTemplate>
        <ChartTemplate
          name="@ossinsight/widget-compose-org-pull-requests-open-to-review"
          visualizer={() => import('@/charts/compose/org/pull-requests-open-to-review/visualization')}
          searchParams={{}}
          height={274}
        />
        <ChartTemplate
          name="@ossinsight/widget-analyze-org-activity-action-top-repos"
          visualizer={() => import('@/charts/analyze/org/activity-action-top-repos/visualization')}
          searchParams={{
            activity: 'reviews/review-comments',
          }}
          height={274}
        />
      </SplitTemplate>
    </SectionTemplate>
  );
}
