'use client';
import ChartTemplate from '@/components/Analyze/Section/Chart';
import { ScrollspySectionWrapper } from '@/components/Scrollspy/SectionWrapper';
import { getWidgetSize } from '@/lib/charts-utils/utils';

export default function CodeReviewEfficiencyContent() {
  return (
    <ScrollspySectionWrapper anchor="code-review-efficiency" className="pt-8 pb-8">
      <h3 className="text-[18px] font-semibold text-[#e9eaee] pb-3" style={{ scrollMarginTop: '140px' }}>Code Review</h3>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4">
            <ChartTemplate
              name="@ossinsight/widget-compose-org-productivity-ratio"
              title="Review Ratio"
              visualizer={() => import('@/charts/analyze/org/activity-action-ratio/visualization')}
              searchParams={{
                activity: 'reviews/reviewed',
              }}
              height={getWidgetSize().widgetWidth(3)}
            />
          </div>
          <div className="col-span-8">
            <ChartTemplate
              name="@ossinsight/widget-analyze-org-recent-pr-review-stats"
              title="Recent PR Review Stats"
              visualizer={() => import('@/charts/analyze/org/recent-pr-review-stats/visualization')}
              searchParams={{}}
              height={getWidgetSize().widgetWidth(3)}
            />
          </div>
        </div>
      </div>
    </ScrollspySectionWrapper>
  );
}
