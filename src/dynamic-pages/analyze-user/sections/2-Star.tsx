import React, { ForwardedRef, forwardRef, useContext, useMemo } from "react";
import Section from "../../../components/Section";
import InViewContext from "../../../components/InViewContext";
import { contributionTypes, usePersonalData } from "../hooks/usePersonal";
import { useAnalyzeUserContext } from "../charts/context";
import Box from "@mui/material/Box";
import { Axis, BarSeries, Dataset, EChartsx, Grid, Legend, LineSeries, Once, Title, Tooltip } from "@djagger/echartsx";
import Typography from "@mui/material/Typography";

export default forwardRef(function StarSection({}, ref: ForwardedRef<HTMLElement>) {
  return (
    <Section ref={ref}>
      <Star />
    </Section>
  );
});

const Star = () => {
  const { userId } = useAnalyzeUserContext();
  const { inView } = useContext(InViewContext)

  return (
    <Box>
      <Typography variant="h2">Star</Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        Star stats in multiple dimensions.
      </Typography>
      <StarChart userId={userId} show={inView} />
    </Box>
  )
}

const StarChart = ({ userId, show }: ModuleProps) => {
  const { data } = usePersonalData('personal-star-history', userId, show)

  const mappedData = useMemo(() => {
    const map = (data?.data ?? []).reduce((dateMap, cv) => {
      return dateMap.set(cv.star_month, (dateMap.get(cv.star_month) ?? 0) + cv.cnt)
    }, new Map<string, number>())

    return Array.from(map.entries()).map(([star_month, cnt]) => ({ star_month, cnt }))
  }, [data])

  return (
    <EChartsx init={{ height: 400, renderer: 'canvas' }} theme='dark'>
      <Once>
        <Title text='Star History' left='center'/>
        <Legend type='scroll' orient='horizontal' top={24} />
        <Grid left={0} right={0} bottom={0} containLabel />
        <Tooltip trigger='axis' axisPointer={{ type: 'line' }}/>
        <Axis.Time.X />
        <Axis.Value.Y />
        <BarSeries encode={{ x: 'star_month', y: 'cnt' }} />
      </Once>
      <Dataset id='original' source={mappedData} />
    </EChartsx>
  )
}

// BUGGY
const StarWithLanguages = ({ userId, show }: ModuleProps) => {
  const { data } = usePersonalData('personal-star-history', userId, show)

  const languages = useMemo(() => {
    return Array.from((data?.data ?? []).reduce((set, item) => set.add(item.language), new Set<string>()))
  }, [data])

  return (
    <EChartsx init={{ height: 400, renderer: 'canvas' }} theme='dark'>
      <Once>
        <Title text='Contribution Trends' left='center'/>
        <Legend type='scroll' orient='horizontal' top={24} />
        <Grid left={0} right={0} bottom={0} containLabel />
        <Tooltip trigger='axis' axisPointer={{ type: 'line' }}/>
        <Axis.Time.X />
        <Axis.Value.Y />
      </Once>
      {languages.map(lang => (
        <>
          <BarSeries key={`${lang}-searies`} name={lang} datasetId={lang} encode={{ x: 'star_month', y: 'cnt' }} stack="0" />
          <Dataset key={lang} id={lang} fromDatasetId='original' transform={{ type: 'filter', config: { value: lang, dimension: 'language' }, print: true }} />
        </>
      ))}
      <Dataset id='original' source={data?.data ?? []} />
    </EChartsx>
  )
}

type ModuleProps = {
  userId: number
  show: boolean
}