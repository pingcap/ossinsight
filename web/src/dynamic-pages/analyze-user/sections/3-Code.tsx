import React, { ForwardedRef, forwardRef, useContext, useMemo, useRef } from 'react';
import Section, { SectionHeading } from '../../../components/Section';
import InViewContext from '../../../components/InViewContext';
import { useAnalyzeUserContext } from '../charts/context';
import { usePersonalData } from '../hooks/usePersonal';
import { EChartsx } from '@site/src/components/ECharts';
import { Axis, BarSeries, Dataset, LineSeries, Once } from '@djagger/echartsx';
import { Common } from '../charts/Common';
import { green, lightGreen, purple, redColors } from '../colors';
import ChartWrapper from '../charts/ChartWrapper';
import { EChartsType } from 'echarts/core';
import { nonEmptyArray } from '@site/src/utils/value';

type PrSize = {
  name: string;
  description: string;
};

// 'xs (0-9 lines)', 's (10-29 lines)', 'm (30-99 lines)', 'l (100-499 lines)', 'xl (500-999 lines)', 'xxl (1000+ lines)'
const sizes: PrSize[] = [
  { name: 'xs', description: '0-9 lines' },
  { name: 's', description: '10-29 lines' },
  { name: 'm', description: '30-99 lines' },
  { name: 'l', description: '100-499 lines' },
  { name: 'xl', description: '500-999 lines' },
  { name: 'xxl', description: '1000+ lines' },

];

export default forwardRef(function CodeSection (_, ref: ForwardedRef<HTMLElement>) {
  return (
    <Section id='code' ref={ref}>
      <Code />
    </Section>
  );
});

const Code = () => {
  const { inView } = useContext(InViewContext);
  const { userId } = useAnalyzeUserContext();

  return (
    <>
      <SectionHeading
        title="Code"
        description="All contributions measured with code related events since 2011.  For example, the history of code submits which includes the pushes and commits, the pull request history which includes merged / un-merged pull requests, the size of pull requests and the code line changes in pull requests."
      />
      <CodeSubmitHistory userId={userId} show={inView} />
      <PullRequestHistory userId={userId} show={inView} />
      <PullRequestSize userId={userId} show={inView} />
      <LineOfCodes userId={userId} show={inView} />
    </>
  );
};

const CodeSubmitHistory = ({ userId, show }: ModuleProps) => {
  const { data, loading } = usePersonalData('personal-pushes-and-commits', userId, show);

  const chart = useRef<EChartsType>(null);

  return (
    <ChartWrapper title="Code Submit History" chart={chart} remoteData={data} loading={loading}>
      <EChartsx init={{ height: 400, renderer: 'canvas' }} theme="dark" ref={chart}>
        <Once>
          <Common />
          <Axis.Time.X min="2011-01-01" />
          <Axis.Value.Y />
          <BarSeries encode={{ x: 'event_month', y: 'pushes' }} name="push" color={green} barMaxWidth={10} />
          <BarSeries encode={{ x: 'event_month', y: 'commits' }} name="commit" color={lightGreen} barMaxWidth={10} />
        </Once>
        <Dataset source={data?.data ?? []} />
      </EChartsx>
    </ChartWrapper>
  );
};

const PullRequestHistory = ({ userId, show }: ModuleProps) => {
  const { data, loading } = usePersonalData('personal-pull-request-action-history', userId, show);

  const chart = useRef<EChartsType>(null);

  return (
    <ChartWrapper title="Pull Request History" chart={chart} remoteData={data} loading={loading}>
      <EChartsx init={{ height: 400, renderer: 'canvas' }} theme="dark" ref={chart}>
        <Once>
          <Common />
          <Axis.Time.X min="2011-01-01" />
          <Axis.Value.Y />
          <LineSeries datasetId="source" encode={{ x: 'event_month', y: 'opened_prs' }} name="Opened PRs" color={green}
                      areaStyle={{ opacity: 0.15 }} symbolSize={0} lineStyle={{ width: 1 }} />
          <LineSeries datasetId="source" encode={{ x: 'event_month', y: 'merged_prs' }} name="Merged PRs" color={purple}
                      areaStyle={{ opacity: 0.15 }} symbolSize={0} lineStyle={{ width: 1 }} />
        </Once>
        <Dataset id="original" source={data?.data ?? []} />
        {nonEmptyArray(data?.data)
          ? <Dataset id="source" fromDatasetId="original"
                         transform={{
                           type: 'sort',
                           config: { dimension: 'event_month', order: 'asc' },
                         }} />
          : undefined}
      </EChartsx>
    </ChartWrapper>
  );
};

const PullRequestSize = ({ userId, show }: ModuleProps) => {
  const { data, loading } = usePersonalData('personal-pull-request-size-history', userId, show);

  const chart = useRef<EChartsType>(null);

  return (
    <ChartWrapper title="Pull Request Size" chart={chart} remoteData={data} loading={loading}>
      <EChartsx init={{ height: 400, renderer: 'canvas' }} theme="dark" ref={chart}>
        <Once>
          <Common />
          <Axis.Time.X min="2011-01-01" />
          <Axis.Value.Y />
          {sizes.reverse().map((size, i) => (
            <BarSeries id={size.name} key={size.name} encode={{ x: 'event_month', y: size.name }} name={`${size.name} (${size.description})`} stack="total"
                       color={redColors.slice(0, 6).reverse()[i]} />
          ))}
        </Once>
        <Dataset source={data?.data ?? []} />
      </EChartsx>
    </ChartWrapper>
  );
};

const LineOfCodes = ({ userId, show }: ModuleProps) => {
  const { data, loading } = usePersonalData('personal-pull-request-code-changes-history', userId, show);

  const mappedData = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return data?.data.map(({ additions, deletions, event_month, changes }) => ({
      additions,
      deletions: -deletions,
      changes,
      event_month,
    })) ?? [];
  }, [data]);

  const chart = useRef<EChartsType>(null);

  return (
    <ChartWrapper title="Lines of changes in PRs" chart={chart} remoteData={data} loading={loading}>
      <EChartsx init={{ height: 400, renderer: 'canvas' }} theme="dark" ref={chart}>
        <Once>
          <Common />
          <Axis.Time.X min="2011-01-01" />
          <Axis.Value.Y id="code" />

          <LineSeries color="#57ab5a" id="add" yAxisId="code" encode={{ x: 'event_month', y: 'additions' }}
                      name="Additions"
                      areaStyle={{}} symbolSize={0} lineStyle={{ width: 0 }} />
          <LineSeries color="#e5534b" id="del" yAxisId="code" encode={{ x: 'event_month', y: 'deletions' }}
                      name="Deletions"
                      areaStyle={{}} symbolSize={0} lineStyle={{ width: 0 }} />
        </Once>
        <Dataset source={mappedData} />
      </EChartsx>
    </ChartWrapper>
  );
};

type ModuleProps = {
  userId: number | undefined;
  show: boolean;
};
