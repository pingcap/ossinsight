'use client';
import ChartTemplate from '@/components/Analyze/Section/Chart';
import { ScrollspySectionWrapper } from '@/components/Scrollspy/SectionWrapper';
import { SectionHeading } from '@/components/ui/SectionHeading';

export default function OverviewContent () {
  return (
    <ScrollspySectionWrapper anchor="overview" className="pb-8">
      <SectionHeading>Organization Overview</SectionHeading>
      <h3 className="text-[18px] font-semibold text-[#e9eaee]">Last 28 days Stats</h3>
      <div className="mt-3 grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="rounded-[6px] bg-[#242526] px-3 py-3">
          <ChartTemplate
            name="@ossinsight/widget-analyze-org-recent-stats"
            visualizer={() => import('@/charts/analyze/org/recent-stats/visualization')}
            searchParams={{ activity: 'stars' }}
            title="Stars"
            height={120}
          />
        </div>
        <div className="rounded-[6px] bg-[#242526] px-3 py-3">
          <ChartTemplate
            name="@ossinsight/widget-analyze-org-recent-stats"
            visualizer={() => import('@/charts/analyze/org/recent-stats/visualization')}
            searchParams={{ activity: 'participants' }}
            title="Participants"
            height={120}
          />
        </div>
        <div className="rounded-[6px] bg-[#242526] px-3 py-3">
          <ChartTemplate
            name="@ossinsight/widget-analyze-org-recent-stats"
            visualizer={() => import('@/charts/analyze/org/recent-stats/visualization')}
            searchParams={{ activity: 'pull-requests' }}
            title="Pull Requests"
            height={120}
          />
        </div>
        <div className="rounded-[6px] bg-[#242526] px-3 py-3">
          <ChartTemplate
            name="@ossinsight/widget-analyze-org-recent-pr-review-stats"
            visualizer={() => import('@/charts/analyze/org/recent-pr-review-stats/visualization')}
            title="Reviews"
            height={120}
          />
        </div>
        <div className="rounded-[6px] bg-[#242526] px-3 py-3">
          <ChartTemplate
            name="@ossinsight/widget-analyze-org-recent-stats"
            visualizer={() => import('@/charts/analyze/org/recent-stats/visualization')}
            searchParams={{ activity: 'issues' }}
            title="Issues"
            height={120}
          />
        </div>
        <div className="rounded-[6px] bg-[#242526] px-3 py-3">
          <ChartTemplate
            name="@ossinsight/widget-analyze-org-recent-stats"
            visualizer={() => import('@/charts/analyze/org/recent-stats/visualization')}
            searchParams={{ activity: 'commits' }}
            title="Commits"
            height={120}
          />
        </div>
      </div>
    </ScrollspySectionWrapper>
  );
}
