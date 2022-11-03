import React, { ForwardedRef, forwardRef, useContext, useRef } from 'react';
import Section, { SectionHeading } from '../../../components/Section';
import { usePersonalData } from '../hooks/usePersonal';
import { EChartsx } from '@site/src/components/ECharts';
import { Axis, BarSeries, Dataset, Once } from '@djagger/echartsx';
import InViewContext from '../../../components/InViewContext';
import { useAnalyzeUserContext } from '../charts/context';
import { Common } from '../charts/Common';
import { blue, lightBlue } from '../colors';
import ChartWrapper from '../charts/ChartWrapper';
import { EChartsType } from 'echarts/core';

export default forwardRef(function IssueSection (_, ref: ForwardedRef<HTMLElement>) {
  return (
    <Section id='issue' ref={ref}>
      <Issue />
    </Section>
  );
});

const Issue = () => {
  const { inView } = useContext(InViewContext);
  const { userId } = useAnalyzeUserContext();

  return (
    <>
      <SectionHeading
        title="Issue"
        description="The history about the total number of issues and issue comments since 2011."
      />
      <IssueHistory show={inView} userId={userId} />
    </>
  );
};

const IssueHistory = ({ userId, show }: ModuleProps) => {
  const { data, loading } = usePersonalData('personal-issues-history', userId, show);

  const chart = useRef<EChartsType>(null);

  return (
    <ChartWrapper title="Issue History" chart={chart} remoteData={data} loading={loading}>
      <EChartsx init={{ height: 400, renderer: 'canvas' }} theme="dark" ref={chart}>
        <Once>
          <Common />
          <Axis.Time.X min="2011-01-01" />
          <Axis.Value.Y />
          <BarSeries encode={{ x: 'event_month', y: 'issues' }} name="issue" color={blue} barMaxWidth={10} />
          <BarSeries encode={{ x: 'event_month', y: 'issue_comments' }} name="issue comments" color={lightBlue} barMaxWidth={10} />
        </Once>
        <Dataset source={data?.data ?? []} />
      </EChartsx>
    </ChartWrapper>
  );
};

type ModuleProps = {
  userId: number | undefined;
  show: boolean;
};
