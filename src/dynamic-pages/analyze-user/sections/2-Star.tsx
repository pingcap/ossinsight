import React, { ForwardedRef, forwardRef, useContext, useMemo, useRef } from "react";
import Section, { SectionHeading } from "../../../components/Section";
import InViewContext from "../../../components/InViewContext";
import { usePersonalData } from "../hooks/usePersonal";
import { useAnalyzeUserContext } from "../charts/context";
import Box from "@mui/material/Box";
import { Axis, BarSeries, Dataset, EChartsx, Grid, Legend, Once, Title, Tooltip } from "@djagger/echartsx";
import { Common } from "../charts/Common";
import { chartColors } from "../colors";
import ChartWrapper from "../charts/ChartWrapper";
import { useDimension } from "../hooks/useDimension";
import { EChartsType } from "echarts/core";

export default forwardRef(function StarSection({}, ref: ForwardedRef<HTMLElement>) {
  return (
    <Section id='star' ref={ref}>
      <Star />
    </Section>
  );
});

const Star = () => {
  const { userId } = useAnalyzeUserContext();
  const { inView } = useContext(InViewContext);

  return (
    <Box>
      <SectionHeading
        title="Star"
        description="The total number of starred repositories and ignore developers' unstarring or restarring behavior since 2011."
      />
      <StarChart userId={userId} show={inView} />
    </Box>
  );
};

const StarChart = ({ userId, show }: ModuleProps) => {
  const { data } = usePersonalData('personal-star-history', userId, show);

  const mappedData = useMemo(() => {
    const map = (data?.data ?? []).reduce((dateMap, cv) => {
      return dateMap.set(cv.star_month, (dateMap.get(cv.star_month) ?? 0) + cv.cnt);
    }, new Map<string, number>());

    return Array.from(map.entries()).map(([star_month, cnt]) => ({ star_month, cnt }));
  }, [data]);

  const chart = useRef<EChartsType | undefined>()

  return (
    <ChartWrapper title="Star History" chart={chart} remoteData={data}>
      <EChartsx init={{ height: 400, renderer: 'canvas' }} theme="dark" ref={chart}>
        <Once>
          <Common />
          <Axis.Time.X min="2011-01-01" />
          <Axis.Value.Y />
          <BarSeries encode={{ x: 'star_month', y: 'cnt' }} color={chartColors} barMaxWidth={10} />
        </Once>
        <Dataset id="original" source={mappedData} />
      </EChartsx>
    </ChartWrapper>
  );
};

// BUGGY
const StarWithLanguages = ({ userId, show }: ModuleProps) => {
  const { data } = usePersonalData('personal-star-history', userId, show);

  const languages = useDimension(data?.data ?? [], 'language')

  return (
    <EChartsx init={{ height: 400, renderer: 'canvas' }} theme="dark">
      <Once>
        <Title text="Contribution Trends" left="center" />
        <Legend type="scroll" orient="horizontal" top={24} />
        <Grid left={0} right={0} bottom={0} containLabel />
        <Tooltip trigger="axis" axisPointer={{ type: 'line' }} />
        <Axis.Time.X />
        <Axis.Value.Y />
      </Once>
      {languages.map(lang => (
        <>
          <BarSeries key={`${lang}-searies`} name={lang} datasetId={lang} encode={{ x: 'star_month', y: 'cnt' }}
                     stack="0" barMaxWidth={10} />
          <Dataset key={lang} id={lang} fromDatasetId="original"
                   transform={{ type: 'filter', config: { value: lang, dimension: 'language' }, print: true }} />
        </>
      ))}
      <Dataset id="original" source={data?.data ?? []} />
    </EChartsx>
  );
};

type ModuleProps = {
  userId: number
  show: boolean
}