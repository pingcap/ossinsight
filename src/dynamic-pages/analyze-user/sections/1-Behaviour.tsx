import React, { ForwardedRef, forwardRef, useContext, useMemo, useState } from "react";
import Section from "../../../components/Section";
import { useAnalyzeUserContext } from "../charts/context";
import InViewContext from "../../../components/InViewContext";
import { Personal, usePersonalData } from "../hooks/usePersonal";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { Select, useEventCallback } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material/Select";


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
      <AllContributions userId={userId} show={inView}/>
      <ContributionTime userId={userId} show={inView}/>
    </>
  );
};


const AllContributions = ({ userId, show }: ModuleProps) => {
  const { data } = usePersonalData('personal-contributions-for-repos', userId, show);

  return (
    <></>
  );
};

const eventTypes = ['IssueCommentEvent', 'IssuesEvent', 'PullRequestEvent', 'PullRequestReviewCommentEvent', 'PushEvent', 'PullRequestReviewEvent']

const ContributionTime = ({ userId, show }: ModuleProps) => {
  const { data } = usePersonalData('personal-contribution-time-distribution', userId, show);
  const [type, setType] = useState('PushEvent')

  const handleEventChange = useEventCallback((e: SelectChangeEvent) => {
    setType(e.target.value)
  })

  const filteredData = useMemo(() => {
    return (data?.data ?? []).filter(item => item.type === type)
  }, [data, type])

  return (
    <Box>
      <Select value={type} onChange={handleEventChange}>
        {eventTypes.map(event => (
          <MenuItem key={event} value={event}>{event}</MenuItem>
        ))}
      </Select>
      <TimeGrid size={14} gap={4} data={filteredData} />
    </Box>
  )
};

interface TimeGridProps {
  size: number;
  gap: number;
  data: Personal<'personal-contribution-time-distribution'>[]
}

const times = Array(24).fill(0).map((_, i) => i);
const days = Array(7).fill(0).map((_, i) => i);

const TimeGrid = ({ size, gap, data }: TimeGridProps) => {
  const max = useMemo(() => {
    return data.reduce((max, cur) => Math.max(max, cur.cnt), 0)
  }, [data])

  const width = useMemo(() => {
    return size * 24 + gap * 23;
  }, [size, gap]);

  const height = useMemo(() => {
    return size * 7 + gap * 6;
  }, [size, gap]);

  const Cube = useMemo(() => styled(Box)({
    width: size,
    height: size,
    borderRadius: 3,
    backgroundColor: getCubeColor(0, 0),
    position: 'absolute',
  }), [size, gap]);

  return (
    <Box sx={{ width, height }} position="relative">
      {times.map(time => days.map(day =>
        <Cube key={`${time}-${day}`} sx={{ top: day * (size + gap), left: time * (size + gap) }}/>,
      ))}
      {data.map(({dayofweek: day, cnt, hour: time, type }) => (
        <Cube key={`${type}-${time}-${day}`} sx={{ top: day * (size + gap), left: time * (size + gap), backgroundColor: getCubeColor(cnt, max) }}/>
      ))}
    </Box>
  );
};

const contributeColors = ['#2C2C2C', '#00480D', '#017420', '#34A352', '#6CDE8C', '#B5FFC9']

const getCubeColor = (num: number, max: number) => {
  const d = num / max
  if (num === 0) {
    return contributeColors[0]
  } else if (d < 1 / 5) {
    return contributeColors[1]
  } else if (d < 2 / 5) {
    return contributeColors[2]
  } else if (d < 3 / 5) {
    return contributeColors[3]
  } else if (d < 4 / 5) {
    return contributeColors[4]
  } else {
    return contributeColors[5]
  }
}

type ModuleProps = {
  userId: number
  show: boolean
}
