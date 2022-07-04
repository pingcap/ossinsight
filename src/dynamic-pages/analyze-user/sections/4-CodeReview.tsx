import React, { ForwardedRef, forwardRef, useContext } from "react";
import Section, { SectionHeading } from "../../../components/Section";
import { usePersonalData } from "../hooks/usePersonal";
import Box from "@mui/material/Box";
import { Axis, BarSeries, Dataset, EChartsx, Grid, Legend, Once, Title, Tooltip } from "@djagger/echartsx";
import InViewContext from "../../../components/InViewContext";
import { useAnalyzeUserContext } from "../charts/context";
import { Common } from "../charts/Common";
import { orange, primary } from "../colors";

export default forwardRef(function CodeReviewSection({}, ref: ForwardedRef<HTMLElement>) {
  return (
    <Section ref={ref}>
      <CodeReview />
    </Section>
  );
});

const CodeReview = () => {
  const { inView } = useContext(InViewContext);
  const { userId } = useAnalyzeUserContext();

  return (
    <>
      <SectionHeading
        title="Code Review"
        description="Code Review stats in multiple dimensions."
      />
      <CodeReviewHistory show={inView} userId={userId} />
    </>
  )
}

const CodeReviewHistory = ({ userId, show }: ModuleProps) => {
  const { data } = usePersonalData('personal-pull-request-reviews-history', userId, show);

  return (
    <Box>
      <EChartsx init={{ height: 400, renderer: 'canvas' }} theme="dark">
        <Once>
          <Title text="Code Review History" left="center"/>
          <Common />
          <Axis.Time.X min='2011-01-01' />
          <Axis.Value.Y/>
          <BarSeries encode={{ x: 'event_month', y: 'reviews' }} name="review" color={orange}/>
          <BarSeries encode={{ x: 'event_month', y: 'review_comments' }} name="review comments" color={primary}/>
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
