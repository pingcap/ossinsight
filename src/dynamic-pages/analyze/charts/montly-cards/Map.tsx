import React, { useMemo } from "react";
import { withBaseOption } from "@djagger/echartsx";
import { useAnalyzeChartContext } from "../context";
import { GeoComponentOption } from "echarts/components";
import WorldMapChart from "../../../../components/BasicCharts/WorldMapChart";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

export default function Map() {
  const { data } = useAnalyzeChartContext<any>();
  const max = useMemo(() => {
    return (data.data?.data ?? []).reduce((prev, current) => Math.max(prev, current.count), 1);
  }, [data]);

  return (
    <Stack sx={{ height: '100%' }}>
      <Typography align='center' fontSize={14}>
        🌟🌟🌟 from <Colored>{data.data?.data?.length ?? '0'}</Colored> Locations
      </Typography>
      <Box flex={1}>
        <WorldMapChart
          data={data.data?.data ?? []}
          dimensionColumnName="country_or_area"
          metricColumnName="count"
          effect={false}
          overrideOptions={{ legend: { show: false } }}
          aspectRatio={false}
        />
      </Box>
    </Stack>

  );
}
const Colored = styled('span')({
  color: '#F58A00',
})