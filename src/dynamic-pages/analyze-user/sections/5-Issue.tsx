import React, { ForwardedRef, forwardRef, useContext } from "react";
import Section, { SectionHeading } from "../../../components/Section";
import { usePersonalData } from "../hooks/usePersonal";
import Box from "@mui/material/Box";
import { Axis, BarSeries, Dataset, EChartsx, Grid, Legend, Once, Title, Tooltip } from "@djagger/echartsx";
import InViewContext from "../../../components/InViewContext";
import { useAnalyzeUserContext } from "../charts/context";

export default forwardRef(function IssueSection({}, ref: ForwardedRef<HTMLElement>) {
  return (
    <Section ref={ref}>
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
        description="Issue stats in multiple dimensions."
      />
      <IssueHistory show={inView} userId={userId} />
    </>
  )
}

const IssueHistory = ({ userId, show }: ModuleProps) => {
  const { data } = usePersonalData('personal-issues-history', userId, show);

  return (
    <Box>
      <EChartsx init={{ height: 400, renderer: 'canvas' }} theme="dark">
        <Once>
          <Title text="Issue History" left="center"/>
          <Legend type="scroll" orient="horizontal" top={24}/>
          <Grid left={0} right={0} bottom={0} containLabel/>
          <Tooltip trigger="axis" axisPointer={{ type: 'line' }}/>
          <Axis.Time.X/>
          <Axis.Value.Y/>
          <BarSeries encode={{ x: 'event_month', y: 'issues' }} name="issue"/>
          <BarSeries encode={{ x: 'event_month', y: 'issue_comments' }} name="issue comments"/>
        </Once>
        <Dataset source={data?.data ?? []}/>
      </EChartsx>
    </Box>
  );
};

type ModuleProps = {
  userId: number
  show: boolean
}
