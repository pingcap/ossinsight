'use client';
import ChartTemplate from '@/components/Analyze/Section/Chart';
import { ScrollspySectionWrapper } from '@/components/Scrollspy/SectionWrapper';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getWidgetSize } from '@/lib/charts-utils/utils';

export default function PRRequestEfficiencyContent() {
  return (
    <ScrollspySectionWrapper anchor="pull-request-efficiency" className="pt-8 pb-8">
      <SectionHeading level="h3">Pull Request</SectionHeading>
      <div className='flex flex-col gap-4'>
        <ChartTemplate
          name='@ossinsight/widget-analyze-org-activity-efficiency'
          title='PR Activity Efficiency'
          visualizer={() => import('@/charts/analyze/org/activity-efficiency/visualization')}
          searchParams={{
            activity: 'pull-requests',
          }}
          height={getWidgetSize().widgetWidth(3)}
          className='w-full overflow-hidden'
        />
      </div>
    </ScrollspySectionWrapper>
  );
}
