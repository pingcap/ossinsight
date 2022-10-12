import React, { useMemo } from "react";
import { Axis, BarSeries, Dataset, EChartsx, Grid as XGrid, Once, Tooltip } from "@djagger/echartsx";
import { useAnalyzeChartContext } from "../context";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useDiff, usePartData, useReversed } from "./hooks";
import { Diff } from "./ui";

interface BarsProps {
  color: string;
  title: string;
  icon: React.ReactNode;
  dayKey?: string;
  dayValueKey: string;
  totalKey: string;
}

export default function BarsCompare({ color, icon, title, dayValueKey, dayKey = 'period_day', totalKey }: BarsProps) {
  const { data } = useAnalyzeChartContext<any>();
  const diff = useDiff(data.data?.data ?? [], totalKey, dayKey)
  const reversed = useReversed(data.data?.data ?? [])
  const currentData = usePartData(reversed, 'current', dayValueKey, dayKey);
  const lastData = usePartData(reversed, 'last', dayValueKey, dayKey);

  return (
    <Box>
      <Box display='flex' flexDirection='column' justifyContent='center'>
        <Typography fontSize={16} fontWeight="bold" whiteSpace="nowrap">
          {icon}
          &nbsp;
          {title}
        </Typography>
        <Typography color={color} fontWeight="bold" fontSize={16}>
          {data.data?.data[0]['current_' + totalKey]}
          <Diff value={diff} />
        </Typography>
      </Box>
      <EChartsx style={{ flex: 1 }} init={{ height: 96, renderer: 'canvas' }} theme="dark">
        <Once>
          <XGrid left={8} right={0} top={4} bottom={0} />
          <Tooltip trigger='axis' axisPointer={{}} formatter={formatter(title)}  />
          <Axis.Category.X axisTick={{ show: false }} axisLabel={{ color: '#7c7c7c', fontSize: 8 }} />
          <Axis.Value.Y axisLabel={{ hideOverlap: true, color: '#7c7c7c', fontSize: 8 }} />
          <BarSeries encode={{ x: 'idx', y: 'value' }} color={color} datasetId='current' barMaxWidth={4} />
          <BarSeries encode={{ x: 'idx', y: 'value' }} color='#7C7C7C' datasetId='last'  barMaxWidth={4} />
        </Once>
        <Dataset id='current' source={currentData} />
        <Dataset id='last' source={lastData} />
      </EChartsx>
    </Box>
  );
}

const formatter = (title: string) => (seriesList: any[]): string => {
  return seriesList.map(series => `${series.marker} ${series.data.day}: <b>${series.data.value}</b> ${title}`).join('<br>')
}
