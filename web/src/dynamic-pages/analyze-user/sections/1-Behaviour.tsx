import React, { ForwardedRef, forwardRef, useContext, useMemo, useRef, useState } from 'react';
import Section, { SectionHeading } from '../../../components/Section';
import { useAnalyzeUserContext } from '../charts/context';
import InViewContext from '../../../components/InViewContext';
import { usePersonalData } from '../hooks/usePersonal';
import {
  InputLabel,
  Select,
  useEventCallback,
  Box,
  MenuItem,
  SelectChangeEvent,
  FormControl,
} from '@mui/material';
import TimeDistribution from '../charts/time-distribution';
import { EChartsx } from '@site/src/components/ECharts';
import { Axis, BarSeries, Dataset, Once } from '@djagger/echartsx';
import { Common } from '../charts/Common';
import { chartColors } from '../colors';
import ChartWrapper from '../charts/ChartWrapper';
import { useDimension } from '../hooks/useDimension';
import { EChartsType } from 'echarts/core';
import { paramCase } from 'param-case';
import { isNullish } from '@site/src/utils/value';

export default forwardRef(function BehaviourSection (_, ref: ForwardedRef<HTMLElement>) {
  return (
    <Section id='behaviour' ref={ref}>
      <Behaviour />
    </Section>
  );
});

const Behaviour = () => {
  const { userId } = useAnalyzeUserContext();
  const { inView } = useContext(InViewContext);

  return (
    <>
      <SectionHeading
        title="Behaviour"
        description="You can see the total contributions in different repositories since 2011, as well as check the status of different contribution categories type by type."
      />
      <AllContributions userId={userId} show={inView} />
      <ContributionTime userId={userId} show={inView} />
    </>
  );
};

const AllContributions = ({ userId, show }: ModuleProps) => {
  const { data, loading } = usePersonalData('personal-contributions-for-repos', userId, show);

  const validEventTypes = useDimension(data?.data ?? [], 'type');

  const repos = useMemo(() => {
    const map = (data?.data ?? []).reduce((map, cv) => {
      return map.set(cv.repo_name, (map.get(cv.repo_name) ?? 0) + cv.cnt);
    }, new Map<string, number>());

    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).map(entry => entry[0]);
  }, [data]);

  const chart = useRef<EChartsType>(null);

  if (isNullish(data)) {
    return <></>;
  }

  return (
    <ChartWrapper title="Type of total contributions" chart={chart} repo remoteData={data} loading={loading}>
      <EChartsx init={{ height: 400, renderer: 'canvas' }} theme="dark" ref={chart}>
        <Once dependencies={[repos]}>
          <Common hideZoom scrollY={10} />
          <Axis.Value.X minInterval={1} />
          <Axis.Category.Y data={repos} inverse triggerEvent />
          {eventTypesWithoutAll.map((event, i) => (
            <BarSeries key={event} datasetId={event} encode={{ x: 'cnt', y: 'repo_name', tooltip: ['cnt'] }}
                       emphasis={{ focus: 'series' }} name={event} stack="0" barMaxWidth={10}
                       color={chartColors[i % chartColors.length]} />
          ))}
          {validEventTypes.map(event => (
            <Dataset key={event} id={event} fromDatasetId="original"
                     transform={{ type: 'filter', config: { value: event, dimension: 'type' } }} />
          ))}
        </Once>
        <Dataset id="original" source={data?.data ?? []} />
      </EChartsx>
    </ChartWrapper>
  );
};

function toCamel (n) {
  return paramCase(n)
    .replace(/^\w/g, a => a.toUpperCase())
    .replace(/-/g, ' ');
}
const eventTypesWithoutAll = ['pushes', 'issues', 'issue_comments', 'pull_requests', 'reviews', 'review_comments'];
const eventTypes = ['all', 'pushes', 'issues', 'issue_comments', 'pull_requests', 'reviews', 'review_comments'];
const timezones: number[] = [];
const periods = ['past_1_year', 'past_3_year', 'all_times'];

const formatZone = (zone: number) => `UTC ${zone < 0 ? zone : `+${zone}`}`;

for (let i = -11; i <= 14; i++) {
  timezones.push(i);
}

const ContributionTime = ({ userId, show }: ModuleProps) => {
  const [period, setPeriod] = useState('past_1_year');
  const { data } = usePersonalData('personal-contribution-time-distribution', userId, show, { period });
  const [type, setType] = useState('all');
  const [zone, setZone] = useState(0);

  const handleEventChange = useEventCallback((e: SelectChangeEvent) => {
    setType(e.target.value);
  });

  const handleZoneChange = useEventCallback((e: SelectChangeEvent<number>) => {
    setZone(Number(e.target.value));
  });

  const handlePeriodChange = useEventCallback((e: SelectChangeEvent) => {
    setPeriod(e.target.value);
  });

  const filteredData = useMemo(() => {
    return (data?.data ?? []).filter(item => item.type === type);
  }, [data, type]);

  const title = useMemo(() => {
    return `Contribution time distribution for ${type} (${formatZone(zone)})`;
  }, [type, zone]);

  return (
    <ChartWrapper title={title} remoteData={data}>
      <Box mt={4} mx="auto" width="max-content">
        <Box mb={2} width="max-content">
          <FormControl variant="standard" size="small" sx={{ minWidth: 80 }}>
            <InputLabel id="period-selector-label">Period</InputLabel>
            <Select labelId="period-selector-label" value={period} onChange={handlePeriodChange}>
              {periods.map(period => (
                <MenuItem key={period} value={period}>{toCamel(period)}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="standard" size="small" sx={{ minWidth: 120, ml: 2 }}>
            <InputLabel id="event-type-selector-label">Contribution Type</InputLabel>
            <Select id="event-type-selector-label" value={type} onChange={handleEventChange}>
              {eventTypes.map(event => (
                <MenuItem key={event} value={event}>{toCamel(event)}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="standard" size="small" sx={{ minWidth: 80, ml: 2 }}>
            <InputLabel id="time-zone-selector-label">Time Zone</InputLabel>
            <Select<number> labelId="time-zone-selector-label" value={zone} onChange={handleZoneChange}>
              {timezones.map(zone => (
                <MenuItem key={zone} value={zone}>{formatZone(zone)}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <TimeDistribution size={18} gap={4} offset={zone} data={filteredData} title={title} />
      </Box>
    </ChartWrapper>
  );
};

type ModuleProps = {
  userId: number | undefined;
  show: boolean;
};
