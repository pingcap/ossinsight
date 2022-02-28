import {GridOption, LegendOption, TooltipOption, XAXisOption, YAXisOption} from "echarts/types/dist/shared";
import React, {useState} from "react";
import {Card, CircularProgress, Stack, useTheme} from "@mui/material";
import Typography from "@mui/material/Typography";
import basicStyle from "./basic.module.css";
import {DebugInfoModel} from "../RemoteCharts/DebugInfoModel";
import {Queries} from "../RemoteCharts/queries";
import {RemoteData} from "../RemoteCharts/hook";

export type QueryParams = {
  [key: string]: any;
};

export interface BaseChartCardProps {
  title: string;
  queryName: string;
  params: QueryParams,
  xAxis?: XAXisOption,
  yAxis?: YAXisOption,
  legend?: LegendOption,
  tooltip?: TooltipOption,
  grid?: GridOption,
  shouldLoad: boolean,
  noLoadReason: string,
  height: string,
}

export interface BaseCardProps {
  title: string;
  shouldLoad: boolean,
  noLoadReason: string,
  loading: boolean,
  error: any,
  height: string,
  children: any,
  query: keyof Queries,
  data: RemoteData<any, any>,
}

export default function BasicCard({
  loading = false, error = false, shouldLoad = false,
  title = "title", height = "100px", noLoadReason, children, query, data
}: BaseCardProps) {
  const theme = useTheme();
  const [showDebugModel, setShowDebugModel] = useState(false);

  const handleShowDebugModel = () => {
    if (data != null) {
      setShowDebugModel(true);
    }
  }

  const handleCloseDebugModel = () => {
    setShowDebugModel(false);
  }

  return <>
    <Card className={basicStyle.basicCard}>
      <Stack className={basicStyle.basicCardHeader} direction="row" justifyContent="space-between" alignItems="center">
        <a
          className={basicStyle.basicCardTitle}
          style={{
            color: theme.palette.text.secondary
          }}
          onClick={handleShowDebugModel}>
          {title}
        </a>
      </Stack>
      {
        (!shouldLoad || loading || error) ?
        <Stack direction="column" justifyContent="center" alignItems="center" style={{height: height}}>
          {
            loading && <CircularProgress/>
          }
          {
            error && <Typography sx={{fontSize: 14}} color="text.secondary" gutterBottom>Failed to load data: {error?.response?.data?.msg}</Typography>
          }
          {
            !shouldLoad && <div>{noLoadReason}</div>
          }
        </Stack> :
        children
      }
    </Card>
    <DebugInfoModel query={query} data={data} open={showDebugModel} onClose={handleCloseDebugModel} />
  </>
}
