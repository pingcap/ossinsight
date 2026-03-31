'use client';
import ChartTemplate from '@/components/Analyze/Section/Chart';
import { ScrollspySectionWrapper } from '@/components/Scrollspy/SectionWrapper';
import { getWidgetSize } from '@/lib/charts-utils/utils';

export default function PRRequestEfficiencyContent() {
  return (
    <ScrollspySectionWrapper anchor="pull-request-efficiency" className="pt-8 pb-8">
      <h3 className="text-[18px] font-semibold text-[#e9eaee] pb-3" style={{ scrollMarginTop: '140px' }}>Pull Request</h3>
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
