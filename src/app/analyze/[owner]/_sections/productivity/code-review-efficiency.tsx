'use client';
import SectionTemplate from '@/components/Analyze/Section';
import ChartTemplate from '@/components/Analyze/Section/Chart';
import { MainSideGridTemplate } from '@/components/Analyze/Section/gridTemplates/MainSideGridTemplate';
import { SplitTemplate } from '@/components/Analyze/Section/gridTemplates/SplitTemplate';
import { getWidgetSize } from '@/lib/widgets-utils/utils';

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
          searchParams={{
            activity: 'reviews/reviewed',
          }}
          height={getWidgetSize().widgetWidth(3)}
        />
        <ChartTemplate
          name="@ossinsight/widget-analyze-org-recent-pr-review-stats"
          searchParams={{}}
          height={getWidgetSize().widgetWidth(3)}
        />
      </MainSideGridTemplate>
      <SplitTemplate>
        <ChartTemplate
          name="@ossinsight/widget-compose-org-pull-requests-open-to-review"
          searchParams={{}}
          height={274}
        />
        <ChartTemplate
          name="@ossinsight/widget-analyze-org-activity-action-top-repos"
          searchParams={{
            activity: 'reviews/review-comments',
          }}
          height={274}
        />
      </SplitTemplate>
    </SectionTemplate>
  );
}
