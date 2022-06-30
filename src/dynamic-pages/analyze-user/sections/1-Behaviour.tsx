import React, { ForwardedRef, forwardRef, useContext, useMemo, useState } from "react";
import Section from "../../../components/Section";
import { useAnalyzeUserContext } from "../charts/context";
import InViewContext from "../../../components/InViewContext";
import { Personal, usePersonalData } from "../hooks/usePersonal";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { InputLabel, Select, useEventCallback } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";


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

const eventTypes = ['IssueCommentEvent', 'IssuesEvent', 'PullRequestEvent', 'PullRequestReviewCommentEvent', 'PushEvent', 'PullRequestReviewEvent'];
const timezones = [];

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
    <Box>
      <Box mb={2}>
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
      <TimeGrid size={14} gap={4} offset={zone} data={filteredData}
                title={`Contribution time distribution for ${type} (${formatZone(zone)})`}/>
    </Box>
  );
};

const formatZone = (zone: number) => `UTC ${zone < 0 ? zone : `+${zone}`}`;

interface TimeGridProps {
  title: string;
  size: number;
  gap: number;
  offset: number;
  data: Personal<'personal-contribution-time-distribution'>[];
}

const times = Array(24).fill(0).map((_, i) => i);
const days = Array(7).fill(0).map((_, i) => i);

const TimeGrid = ({ title, size, gap, offset, data }: TimeGridProps) => {
  const max = useMemo(() => {
    return data.reduce((max, cur) => Math.max(max, cur.cnt), 0);
  }, [data]);

  const paddingTop = 20;

  const width = useMemo(() => {
    return size * 24 + gap * 23;
  }, [size, gap]);

  const height = useMemo(() => {
    return size * 7 + gap * 6 + 40 /* for legends */;
  }, [size, gap]);

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height + paddingTop}
         viewBox={`0 -${paddingTop} ${width} ${height}`} display="block">
      <g id="title">
        <text textAnchor="middle" x="50%" y={8 - paddingTop} fontSize={14} fill="#dadada" fontWeight="bold">
          {title}
        </text>
      </g>
      <g id="chart">
        {times.map(time => days.map(day =>
          <rect
            key={`${time}-${day}`}
            x={time * (size + gap)}
            y={day * (size + gap)}
            width={size}
            height={size}
            rx={3}
            ry={3}
            fill={getColor(0, 0)}
          />,
        ))}
        {data.map(({ dayofweek: day, cnt, hour: time, type }) => (
          <rect
            key={`${time}-${day}`}
            x={((24 + time + offset) % 24) * (size + gap)}
            y={day * (size + gap)}
            width={size}
            height={size}
            rx={3}
            ry={3}
            fill={getColor(cnt, max)}
          />
        ))}
      </g>
      <g id="legend">
        <text fontSize={12} fill="#dadada" x="0" y={height - 29} alignmentBaseline="text-before-edge">less</text>
        {contributeDistributionColors.map((color, i) => (
          <rect
            key={color}
            fill={color}
            x={35 + i * (size + 4)}
            y={height - 28}
            width={size}
            height={size}
            rx={3}
            ry={3}
          />
        ))}
        <text fontSize={12} fill="#dadada" x="150" y={height - 29} alignmentBaseline="text-before-edge">more</text>
      </g>
    </svg>
  );
};

const contributeDistributionColors = ['#2C2C2C', '#00480D', '#017420', '#34A352', '#6CDE8C', '#B5FFC9'];

const getColor = (num: number, max: number) => {
  const d = num / max;
  if (num === 0) {
    return contributeDistributionColors[0];
  } else if (d < 1 / 5) {
    return contributeDistributionColors[1];
  } else if (d < 2 / 5) {
    return contributeDistributionColors[2];
  } else if (d < 3 / 5) {
    return contributeDistributionColors[3];
  } else if (d < 4 / 5) {
    return contributeDistributionColors[4];
  } else {
    return contributeDistributionColors[5];
  }
};

type ModuleProps = {
  userId: number
  show: boolean
}
