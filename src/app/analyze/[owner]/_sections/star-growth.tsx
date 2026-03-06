'use client';
import { MainSideGridTemplate } from '@/components/Analyze/Section/gridTemplates/MainSideGridTemplate';
import * as React from 'react';

import SectionTemplate from '@/components/Analyze/Section';
import ChartTemplate from '@/components/Analyze/Section/Chart';
import { AnalyzeOwnerContext } from '@/components/Context/Analyze/AnalyzeOwner';
import {
  CompanyRankTable,
  GeoRankTable,
} from '@/components/Analyze/Table/RankTable';
import { getWidgetSize } from '@/lib/widgets-utils/utils';
import { useSearchParams } from 'next/navigation';

export default function StarGrowthContent() {
  const { id: orgId } = React.useContext(AnalyzeOwnerContext);

  const params = useSearchParams() ?? new URLSearchParams();
  const repoIds = params.get('repoIds')?.toString() || '';
  const period = params.get('period')?.toString() || '';

  return (
    <SectionTemplate
      title='Popularity'
      description="Discover the popularity and reach of your repositories through stars, enabling you to gauge the community's interest and identify potential collaboration opportunities."
      level={2}
      className='pt-8'
    >
      <SectionTemplate
        title='Star Growth'
        id='star-growth'
        level={3}
        className='pt-8 flex flex-col gap-4'
      >
        <MainSideGridTemplate>
          <ChartTemplate
            name='@ossinsight/widget-compose-org-activity-growth-total'
            searchParams={{
              activity: 'stars',
            }}
            height={getWidgetSize().widgetWidth(4)}
          />
          <ChartTemplate
            name='@ossinsight/widget-compose-org-stars-top-repos'
            searchParams={{}}
            height={getWidgetSize().widgetWidth(4)}
          />
        </MainSideGridTemplate>

        <OrgActivityCompany orgId={orgId} />

        <MainSideGridTemplate>
          <ChartTemplate
            name='@ossinsight/widget-compose-org-activity-map'
            searchParams={{
              activity: 'stars',
              role: 'stars'
            }}
            height={365}
          />
          <GeoRankTable
            key={orgId + repoIds + period}
            id={orgId}
            type='stars'
            role='stars'
            className={`h-[365px]`}
          />
        </MainSideGridTemplate>
      </SectionTemplate>
    </SectionTemplate>
  );
}

function OrgActivityCompany(props: { orgId?: number }) {
  const { orgId } = props;

  const [excludeSeenBefore, setExcludeSeenBefore] =
    React.useState<boolean>(false);

  const params = useSearchParams() ?? new URLSearchParams();
  const repoIds = params.get('repoIds')?.toString();
  const period = params.get('period')?.toString();

  const handleChangeExcludeSeenBefore = React.useCallback(
    (newValue?: boolean) => {
      setExcludeSeenBefore(!!newValue);
    },
    []
  );

  return (
    <MainSideGridTemplate>
      <ChartTemplate
        name='@ossinsight/widget-compose-org-activity-company'
        searchParams={{
          activity: 'stars',
          role: 'stars',
          excludeSeenBefore: excludeSeenBefore ? 'true' : 'false',
        }}
        height={405}
      />
      <CompanyRankTable
        key={'stars' + repoIds + period + (excludeSeenBefore ? 'new' : 'all')}
        id={orgId}
        type='stars'
        role='stars'
        className={`h-[405px]`}
        excludeSeenBefore={excludeSeenBefore}
        handleExcludeSeenBefore={handleChangeExcludeSeenBefore}
      />
    </MainSideGridTemplate>
  );
}
