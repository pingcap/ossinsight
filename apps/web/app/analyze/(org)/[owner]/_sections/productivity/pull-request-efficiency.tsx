'use client';
import SectionTemplate from '@/components/Analyze/Section';
import ChartTemplate from '@/components/Analyze/Section/Chart';
import { MainSideGridTemplate } from '@/components/Analyze/Section/gridTemplates/MainSideGridTemplate';
import { SplitTemplate } from '@/components/Analyze/Section/gridTemplates/SplitTemplate';
import { getWidgetSize } from '@/utils/format';

export default function PRRequestEfficiencyContent() {
  return (
    <SectionTemplate
      id='pull-request-efficiency'
      title='Pull Request'
      level={3}
      className='pt-8 flex flex-col gap-4'
    >
      {/* <MainSideGridTemplate inverse>
        <ChartTemplate
          name='@ossinsight/widget-compose-org-productivity-ratio'
          searchParams={{
            activity: 'pull-requests/merged',
          }}
          height={getWidgetSize().widgetWidth(3)}
        />
        <ChartTemplate
          name='@ossinsight/widget-analyze-org-activity-efficiency'
          searchParams={{
            activity: 'pull-requests',
          }}
          height={getWidgetSize().widgetWidth(3)}
        />
      </MainSideGridTemplate> */}
      <div className='grid grid-cols-12 gap-4'>
        <div className='col-span-12 sm:col-span-5 md:col-span-4 lg:col-span-3'>
          <ChartTemplate
            name='@ossinsight/widget-compose-org-productivity-ratio'
            visualizer={() => import('@/charts/compose/org/productivity-ratio/visualization')}
            searchParams={{
              activity: 'pull-requests/merged',
            }}
            height={getWidgetSize().widgetWidth(3)}
            className='w-full overflow-hidden'
          />
        </div>
        <div className='col-span-12 sm:col-span-5 md:col-span-4 lg:col-span-3'>
          <ChartTemplate
            name='@ossinsight/widget-compose-org-productivity-ratio'
            visualizer={() => import('@/charts/compose/org/productivity-ratio/visualization')}
            searchParams={{
              activity: 'pull-requests/self-merged',
            }}
            height={getWidgetSize().widgetWidth(3)}
            className='w-full overflow-hidden'
          />
        </div>
        <div className='col-span-12 sm:col-span-7 md:col-span-8 lg:col-span-6'>
          <ChartTemplate
            name='@ossinsight/widget-analyze-org-activity-efficiency'
            visualizer={() => import('@/charts/analyze/org/activity-efficiency/visualization')}
            searchParams={{
              activity: 'pull-requests',
            }}
            height={getWidgetSize().widgetWidth(3)}
            className='w-full overflow-hidden'
          />
        </div>
      </div>
      <SplitTemplate>
        <ChartTemplate
          name='@ossinsight/widget-compose-org-activity-open-to-close'
          visualizer={() => import('@/charts/compose/org/activity-open-to-close/visualization')}
          searchParams={{
            activity: 'pull-requests',
          }}
          height={274}
        />
        <ChartTemplate
          name='@ossinsight/widget-compose-org-activity-open-to-first-response'
          visualizer={() => import('@/charts/compose/org/activity-open-to-first-response/visualization')}
          searchParams={{
            activity: 'pull-requests',
          }}
          height={274}
        />
      </SplitTemplate>
    </SectionTemplate>
  );
}
