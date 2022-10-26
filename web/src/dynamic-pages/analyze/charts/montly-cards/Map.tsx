import React from "react";
import { useAnalyzeChartContext } from "../context";
import WorldMapChart from "../../../../components/BasicCharts/WorldMapChart";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { styled, useTheme } from "@mui/material/styles";

export default function Map() {
  const { data } = useAnalyzeChartContext<any>();

  return (
    <Stack sx={{ height: '100%' }}>
      <Typography component="h4" align="center" fontSize={14}>
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
});