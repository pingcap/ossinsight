import React, { ForwardedRef, forwardRef, useContext } from "react";
import Section, { SectionHeading } from "../../../components/Section";
import { usePersonalData } from "../hooks/usePersonal";
import Box from "@mui/material/Box";
import { Axis, BarSeries, Dataset, EChartsx, Grid, Legend, Once, Title, Tooltip } from "@djagger/echartsx";
import InViewContext from "../../../components/InViewContext";
import { useAnalyzeUserContext } from "../charts/context";
import { Common } from "../charts/Common";
import { blue, lightBlue } from "../colors";

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
          <Common />
          <Axis.Time.X min='2011-01-01' />
          <Axis.Value.Y/>
          <BarSeries encode={{ x: 'event_month', y: 'issues' }} name="issue" color={blue} />
          <BarSeries encode={{ x: 'event_month', y: 'issue_comments' }} name="issue comments" color={lightBlue} />
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
