import React, { ForwardedRef, forwardRef, useContext, useMemo, useState } from "react";
import Section from "../../../components/Section";
import { useAnalyzeUserContext } from "../charts/context";
import InViewContext from "../../../components/InViewContext";
import { contributionTypes, Personal, usePersonalData } from "../hooks/usePersonal";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { InputLabel, Select, useEventCallback } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import TimeDistribution from "../charts/time-distribution";
import { Axis, BarSeries, Dataset, EChartsx, Grid, Legend, Once, Title, Tooltip } from "@djagger/echartsx";
import Typography from "@mui/material/Typography";
import Link from "@docusaurus/Link";


export default forwardRef(function BehaviourSection({}, ref: ForwardedRef<HTMLElement>) {
  return (
    <Section ref={ref}>
      <Behaviour/>
    </Section>
  );
});


const Behaviour = () => {
  const { userId } = useAnalyzeUserContext();
  const { inView } = useContext(InViewContext);

  return (
    <>
      <Typography variant="h2">Behaviour</Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        Contribution stats in multiple dimensions.
      </Typography>
      <AllContributions userId={userId} show={inView}/>
      <ContributionTime userId={userId} show={inView}/>
    </>
  );
};


const AllContributions = ({ userId, show }: ModuleProps) => {
  const { data } = usePersonalData('personal-contributions-for-repos', userId, show);

  const repos = useMemo(() => {
    const map = (data?.data ?? []).reduce((map, cv) => {
      return map.set(cv.repo_name, (map.get(cv.repo_name) ?? 0) + cv.cnt)
    }, new Map<string, number>())

    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).map(entry => entry[0]).slice(0, 20)
  }, [data])

  if (!data) {
    return <></>
  }

  return (
    <EChartsx init={{ height: 800, renderer: 'canvas' }} theme='dark'>
      <Once>
        <Title text='Type of total contributions' left='center'/>
        <Legend type='scroll' orient='horizontal' top={24} />
        <Grid left={0} right={0} bottom={0} containLabel />
        <Tooltip trigger='axis' axisPointer={{ type: 'shadow' }}/>
        <Axis.Value.X />
        <Axis.Category.Y data={repos} inverse />
        {eventTypes.map(event => (
          <BarSeries datasetId={event} encode={{ x: 'cnt', y: 'repo_name', tooltip: ['type', 'cnt'] }} emphasis={{ focus: 'series' }} name={event} stack='0' />
        ))}
        {eventTypes.map(event => (
          <Dataset key={event} id={event} fromDatasetId='original' transform={{ type: 'filter', config: { value: event, dimension: 'type' } }} />
        ))}
      </Once>
      <Dataset id='original' source={data?.data ?? []} />
    </EChartsx>
  );
};

const eventTypes = ['IssueCommentEvent', 'IssuesEvent', 'PullRequestEvent', 'PullRequestReviewCommentEvent', 'PushEvent', 'PullRequestReviewEvent'];
const timezones = [];

const formatZone = (zone: number) => `UTC ${zone < 0 ? zone : `+${zone}`}`;

for (let i = -11; i <= 14; i++) {
  timezones.push(i);
}

const ContributionTime = ({ userId, show }: ModuleProps) => {
  const { data } = usePersonalData('personal-contribution-time-distribution', userId, show);
  const [type, setType] = useState('PushEvent');
  const [zone, setZone] = useState(0);

  const handleEventChange = useEventCallback((e: SelectChangeEvent) => {
    setType(e.target.value);
  });

  const handleZoneChange = useEventCallback((e: SelectChangeEvent<number>) => {
    setZone(Number(e.target.value));
  });

  const filteredData = useMemo(() => {
    return (data?.data ?? []).filter(item => item.type === type);
  }, [data, type]);

  return (
    <Box mt={4} mx='auto'  width='max-content'>
      <Box mb={2} width='max-content'>
        <FormControl variant="standard" size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="event-type-selector-label">Event Type</InputLabel>
          <Select id="event-type-selector-label" value={type} onChange={handleEventChange}>
            {eventTypes.map(event => (
              <MenuItem key={event} value={event}>{event}</MenuItem>
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
      <TimeDistribution size={14} gap={4} offset={zone} data={filteredData}
                title={`Contribution time distribution for ${type} (${formatZone(zone)})`}/>
    </Box>
  );
};

type ModuleProps = {
  userId: number
  show: boolean
}
