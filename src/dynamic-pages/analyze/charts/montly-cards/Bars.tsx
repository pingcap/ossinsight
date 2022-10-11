import React, { useMemo } from "react";
import { Axis, BarSeries, Dataset, EChartsx, Grid as XGrid, Once, Tooltip } from "@djagger/echartsx";
import { useAnalyzeChartContext } from "../context";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useReversed } from "./hooks";

//s.idx AS idx,
//     cp.day AS current_period_day,
//     IFNULL(cp.stars, 0) AS current_period_day_stars,
//     IFNULL(cpt.total, 0) AS current_period_stars,
//     lp.day AS last_period_day,
//     IFNULL(lp.stars, 0) AS last_period_day_stars,
//     IFNULL(lpt.total, 0) AS last_period_stars
type StarData = {
  idx: number
  current_period_day: string
  current_period_day_stars: number
  current_period_stars: number
  last_period_day: string
  last_period_day_stars: number
  last_period_stars: number
}

const DATE_FMT = 'yyyy-MM-dd';


interface BarsProps {
  color: string;
  title: string;
  icon: React.ReactNode;
  dayKey?: string;
  dayValueKey: string;
  totalKey: string;
}

export default function Bars({ color, icon, title, dayValueKey, dayKey = 'current_period_day', totalKey }: BarsProps) {
  const { data } = useAnalyzeChartContext<StarData>();

  return (
    <Stack direction="row">
      <Box minWidth={96} display='flex' flexDirection='column' justifyContent='center'>
        <Typography fontSize={16} fontWeight="bold" whiteSpace="nowrap">
          {icon}
          &nbsp;
          {title}
        </Typography>
        <Typography color={color} fontWeight="bold" fontSize={24}>{data.data?.data[0][totalKey]}</Typography>
      </Box>
      <EChartsx style={{ flex: 1 }} init={{ height: 96, renderer: 'canvas' }} theme="dark">
        <Once>
          <XGrid left={8} right={0} top={4} bottom={0} />
          <Tooltip formatter={params => `${params.marker} ${params.value[dayKey]}: <b>${params.value[dayValueKey]}</b> ${title}`} />
          <Axis.Category.X axisTick={{ show: false }} axisLabel={{ color: '#7c7c7c', fontSize: 8 }} />
          <Axis.Value.Y axisLabel={{ hideOverlap: true, color: '#7c7c7c', fontSize: 8 }} />
          <BarSeries encode={{ x: 'idx', y: dayValueKey }} color={color} />
        </Once>
        <Dataset source={useReversed(data.data?.data ?? [])} />
      </EChartsx>
    </Stack>
  );
}
