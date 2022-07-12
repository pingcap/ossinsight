import React, { ForwardedRef, forwardRef, useContext, useRef } from "react";
import Section, { SectionHeading } from "../../../components/Section";
import { usePersonalData } from "../hooks/usePersonal";
import { Axis, BarSeries, Dataset, EChartsx, Once } from "@djagger/echartsx";
import InViewContext from "../../../components/InViewContext";
import { useAnalyzeUserContext } from "../charts/context";
import { Common } from "../charts/Common";
import { orange, primary } from "../colors";
import ChartWrapper from "../charts/ChartWrapper";
import { EChartsType } from "echarts/core";

export default forwardRef(function CodeReviewSection({}, ref: ForwardedRef<HTMLElement>) {
  return (
    <Section id='code-review' ref={ref}>
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
        description="The history about the number of code review times and comments in pull requests since 2011."
      />
      <CodeReviewHistory show={inView} userId={userId} />
    </>
  );
};

const CodeReviewHistory = ({ userId, show }: ModuleProps) => {
  const { data } = usePersonalData('personal-pull-request-reviews-history', userId, show);

  const chart = useRef<EChartsType | undefined>()

  return (
    <ChartWrapper title="Code Review History" chart={chart} remoteData={data}>
      <EChartsx init={{ height: 400, renderer: 'canvas' }} theme="dark" ref={chart}>
        <Once>
          <Common />
          <Axis.Time.X min="2011-01-01" />
          <Axis.Value.Y />
          <BarSeries encode={{ x: 'event_month', y: 'reviews' }} name="review" color={orange} barMaxWidth={10} />
          <BarSeries encode={{ x: 'event_month', y: 'review_comments' }} name="review comments" color={primary} barMaxWidth={10} />
        </Once>
        <Dataset source={data?.data ?? []} />
      </EChartsx>
    </ChartWrapper>
  );
};

type ModuleProps = {
  userId: number
  show: boolean
}
