import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Axis, Dataset, EChartsx, LineSeries, Once, Tooltip } from "@djagger/echartsx";
import { Grid as XGrid } from "@djagger/echartsx/dist/components/option/gird";
import Stack from "@mui/material/Stack";
import { useAnalyzeChartContext } from "../context";
import { useReversed } from "./hooks";

interface LinesProps {
  title: string;
  colors?: [string, string];
  icon: React.ReactNode;
  openedText?: string;
  closedText: string;
  dayKey?: string;
  dayOpenedValueKey: string;
  dayClosedValueKey: string;
  totalOpenedValueKey: string;
  totalClosedValueKey: string;
}

const DEFAULT_COLORS: [string, string] = ['#63C16D', '#904DC9'];
export default function Lines({
                                icon,
                                title,
                                colors = DEFAULT_COLORS,
                                openedText = 'Opened',
                                closedText,
                                dayOpenedValueKey,
                                totalOpenedValueKey,
                                totalClosedValueKey,
                                dayClosedValueKey,
                                dayKey = 'current_period_day',
                              }: LinesProps) {
  const { data } = useAnalyzeChartContext();
  return (
    <>
      <Box minWidth={96}>
        <Typography fontSize={16} fontWeight="bold" whiteSpace="nowrap">
          {icon}
          &nbsp;
          {title}
        </Typography>
        <Stack direction='row'>
          <Box>
            <Typography color='#7C7C7C' fontSize={14}>{openedText}</Typography>
            <Typography color={colors[0]} fontWeight="bold" fontSize={24}>{data.data?.data[0][totalOpenedValueKey]}</Typography>
          </Box>
          <Box ml={2}>
            <Typography color='#7C7C7C' fontSize={14}>{closedText}</Typography>
            <Typography color={colors[1]} fontWeight="bold" fontSize={24}>{data.data?.data[0][totalClosedValueKey]}</Typography>
          </Box>
        </Stack>
      </Box>
      <EChartsx style={{ flex: 1 }} init={{ height: 96, renderer: 'canvas' }} theme="dark">
        <Once>
          <XGrid left={0} top={8} bottom={8} right={0} />
          <Tooltip formatter={params => `${params.marker} ${params.value[dayKey]}: <b>${params.value[dayOpenedValueKey]}</b> ${openedText}`} />
          <Axis.Category.X axisTick={{ show: false }} axisLabel={{ color: '#7c7c7c' }} />
          <Axis.Value.Y axisLabel={{ hideOverlap: true, color: '#7c7c7c' }} />
          <LineSeries encode={{ x: 'idx', y: dayOpenedValueKey }} color={colors[0]} />
          <LineSeries encode={{ x: 'idx', y: dayClosedValueKey }} color={colors[1]} />
        </Once>
        <Dataset source={useReversed(data.data?.data ?? [])} />
      </EChartsx>
    </>
  );
}