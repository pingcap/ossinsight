import React, { ForwardedRef, forwardRef, useContext, useMemo } from "react";
import Section, { SectionHeading } from "../../../components/Section";
import InViewContext from "../../../components/InViewContext";
import { useAnalyzeUserContext } from "../charts/context";
import { usePersonalData } from "../hooks/usePersonal";
import Box from "@mui/material/Box";
import { Axis, BarSeries, Dataset, EChartsx, Grid, Legend, LineSeries, Once, Title, Tooltip } from "@djagger/echartsx";

export default forwardRef(function CodeSection({}, ref: ForwardedRef<HTMLElement>) {
  return (
    <Section ref={ref}>
      <Code/>
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
        description="Code stats in multiple dimensions."
      />
      <CodeSubmitHistory userId={userId} show={inView}/>
      <PullRequestHistory userId={userId} show={inView}/>
      <PullRequestSize userId={userId} show={inView}/>
      <LineOfCodes userId={userId} show={inView}/>
    </>
  );
};

const CodeSubmitHistory = ({ userId, show }: ModuleProps) => {
  const { data } = usePersonalData('personal-pushes-and-commits', userId, show);

  return (
    <Box>
      <EChartsx init={{ height: 400, renderer: 'canvas' }} theme="dark">
        <Once>
          <Title text="Code Submit History" left="center"/>
          <Legend type="scroll" orient="horizontal" top={24}/>
          <Grid left={0} right={0} bottom={0} containLabel/>
          <Tooltip trigger="axis" axisPointer={{ type: 'line' }}/>
          <Axis.Time.X/>
          <Axis.Value.Y/>
          <BarSeries encode={{ x: 'event_month', y: 'pushes' }} name="push"/>
          <BarSeries encode={{ x: 'event_month', y: 'commits' }} name="commit"/>
        </Once>
        <Dataset source={data?.data ?? []}/>
      </EChartsx>
    </Box>
  );
};

const PullRequestHistory = ({ userId, show }: ModuleProps) => {
  const { data } = usePersonalData('personal-pull-request-action-history', userId, show);

  return (
    <Box>
      <EChartsx init={{ height: 400, renderer: 'canvas' }} theme="dark">
        <Once>
          <Title text="Pull Request History" left="center"/>
          <Legend type="scroll" orient="horizontal" top={24}/>
          <Grid left={0} right={0} bottom={0} containLabel/>
          <Tooltip trigger="axis" axisPointer={{ type: 'line' }}/>
          <Axis.Time.X/>
          <Axis.Value.Y/>
          <LineSeries datasetId="source" encode={{ x: 'event_month', y: 'opened_prs' }} name="Opened PRs"/>
          <LineSeries datasetId="source" encode={{ x: 'event_month', y: 'merged_prs' }} name="Merged PRs"/>
        </Once>
        <Dataset id="original" source={data?.data ?? []}/>
        {data ? <Dataset id="source" fromDatasetId="original"
                         transform={{ type: 'sort', config: { dimension: 'event_month', order: 'asc' } }}/> : undefined}
      </EChartsx>
    </Box>
  );
};

const PullRequestSize = ({ userId, show }: ModuleProps) => {
  const { data } = usePersonalData('personal-pull-request-size-history', userId, show);

  return (
    <Box>
      <EChartsx init={{ height: 400, renderer: 'canvas' }} theme="dark">
        <Once>
          <Title text="Pull Request Size" left="center"/>
          <Legend type="scroll" orient="horizontal" top={24}/>
          <Grid left={0} right={0} bottom={0} containLabel/>
          <Tooltip trigger="axis" axisPointer={{ type: 'line' }}/>
          <Axis.Time.X/>
          <Axis.Value.Y/>
          {['xs', 's', 'm', 'l', 'xl', 'xxl'].map(size => (
            <BarSeries id={size} key={size} encode={{ x: 'event_month', y: size }} name={size} stack="total"/>
          ))}
        </Once>
        <Dataset source={data?.data ?? []}/>
      </EChartsx>
    </Box>
  );
};

const LineOfCodes = ({ userId, show }: ModuleProps) => {
  const { data } = usePersonalData('personal-pull-request-code-changes-history', userId, show);

  const mappedData = useMemo(() => {
    return data?.data.map(({ additions, deletions, event_month, changes }) => ({
      additions,
      deletions: -deletions,
      changes,
      event_month,
    })) ?? [];
  }, [data]);

  return (
    <Box>
      <EChartsx init={{ height: 400, renderer: 'canvas' }} theme="dark">
        <Once>
          <Title text="Pull Request History" left="center"/>
          <Legend type="scroll" orient="horizontal" top={24}/>
          <Grid left={0} right={0} bottom={0} containLabel/>
          <Tooltip trigger="axis" axisPointer={{ type: 'line' }}/>
          <Axis.Time.X/>
          <Axis.Value.Y id="code"/>

          <LineSeries color="#57ab5a" id="add" yAxisId="code" encode={{ x: 'event_month', y: 'additions' }}
                      name="Additions"
                      areaStyle={{}} symbolSize={0} lineStyle={{ width: 0 }}/>
          <LineSeries color="#e5534b" id="del" yAxisId="code" encode={{ x: 'event_month', y: 'deletions' }}
                      name="Deletions"
                      areaStyle={{}} symbolSize={0} lineStyle={{ width: 0 }}/>
        </Once>
        <Dataset source={mappedData}/>
      </EChartsx>
    </Box>
  );
};

type ModuleProps = {
  userId: number
  show: boolean
}
