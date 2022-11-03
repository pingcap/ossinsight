import React, { ForwardedRef, forwardRef, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Section from '../../../components/Section/Section';
import InViewContext from '../../../components/InViewContext';
import { useAnalyzeUserContext } from '../charts/context';
import { ContributionActivityRange, contributionActivityRanges, ContributionActivityType, contributionActivityTypes, usePersonalContributionActivities, useRange } from '../hooks/usePersonal';
import { EChartsx } from '@site/src/components/ECharts';
import { Axis, Dataset, Grid, Legend, Once, Title, Tooltip, withBaseOption } from '@djagger/echartsx';
import { useDimension } from '../hooks/useDimension';
import { ScatterSeriesOption } from 'echarts/charts';
import { primary } from '../colors';
import { TooltipFormatterCallback } from 'echarts/types/dist/shared';
import {
  InputLabel,
  Select,
  useEventCallback,
  Box,
  MenuItem,
  FormControl,
  SelectChangeEvent,
} from '@mui/material';
import { SectionHeading } from '../../../components/Section';
import ChartWrapper from '../charts/ChartWrapper';
import { EChartsType } from 'echarts/core';

export default forwardRef(function ActivitiesSection (_, ref: ForwardedRef<HTMLElement>) {
  return (
    <Section id="activities" ref={ref}>
      <SectionHeading
        title="Contribution Activities"
        description={<>All personal activities happened on <b>all public repositories</b> in GitHub since 2011. You can check each specific activity type by type with a timeline.</>}
      />
      <Activities />
    </Section>
  );
});

const Activities = () => {
  const { inView } = useContext(InViewContext);
  const { userId } = useAnalyzeUserContext();

  return (
    <>
      <ActivityChart show={inView} userId={userId} />
    </>
  );
};

const Scatter = withBaseOption<ScatterSeriesOption>('series', { type: 'scatter' }, 'Scatter');

const ActivityChart = ({ userId, show }: ModuleProps) => {
  const [type, setType] = useState<ContributionActivityType>('all');
  const [period, setPeriod] = useState<ContributionActivityRange>('last_28_days');

  const { data, loading } = usePersonalContributionActivities(userId, type, period, show);
  const repoNames = useDimension(data?.data ?? [], 'repo_name');

  const [min, max] = useRange(period);

  const typeString = useMemo(() => contributionActivityTypes.find(({ key }) => type === key)?.label, [type]);
  const periodString = useMemo(() => contributionActivityRanges.find(({ key }) => period === key)?.label, [period]);

  const tooltipFormatter: TooltipFormatterCallback<any> = useCallback(({ value }) => {
    return `${value.event_period as string} ${value.cnt as number} ${typeString as string} on ${value.repo_name as string}`;
  }, [typeString]);

  const handleTypeChange = useEventCallback((e: SelectChangeEvent<ContributionActivityType>) => {
    setType(e.target.value as ContributionActivityType);
  });
  const handlePeriodChange = useEventCallback((e: SelectChangeEvent<ContributionActivityRange>) => {
    setPeriod(e.target.value as ContributionActivityRange);
  });

  const title = useMemo(() => {
    return `${typeString ?? 'undefined'} in ${periodString ?? 'undefined'}`;
  }, [typeString, periodString]);

  const chart = useRef<EChartsType>(null);

  return (
    <ChartWrapper title={title} chart={chart} repo remoteData={data} loading={loading}>
      <Box mb={2}>
        <FormControl variant="standard" size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="event-type-selector-label">Contribution type</InputLabel>
          <Select id="event-type-selector-label" value={type} onChange={handleTypeChange}>
            {contributionActivityTypes.map(({ key, label }) => (
              <MenuItem key={key} value={key}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl variant="standard" size="small" sx={{ minWidth: 120, ml: 2 }}>
          <InputLabel id="event-type-selector-label">Period</InputLabel>
          <Select id="event-type-selector-label" value={period} onChange={handlePeriodChange}>
            {contributionActivityRanges.map(({ key, label }) => (
              <MenuItem key={key} value={key}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <EChartsx init={{ height: 240 + 30 * repoNames.length, renderer: 'canvas' }} theme="dark" ref={chart}>
        <Once>
          <Legend type="scroll" orient="horizontal" top={32} />
          <Grid top={64} left={8} right={8} bottom={8} containLabel />
          <Tooltip trigger="item" />
          <Axis.Category.Y axisTick={{ show: false }} axisLine={{ show: false }} triggerEvent />
        </Once>
        <Title text={title} left="center" />
        <Axis.Time.X min={min} max={max} />
        <Scatter encode={{ x: 'event_period', y: 'repo_name', value: 'cnt' }} symbolSize={(val) => Math.min(val.cnt * 5, 60)} tooltip={{ formatter: tooltipFormatter }} color={primary} />
        <Dataset source={data?.data ?? []} />
      </EChartsx>
    </ChartWrapper>
  );
};

type ModuleProps = {
  userId: number | undefined;
  show: boolean;
};
