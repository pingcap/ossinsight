import {GridOption, LegendOption, TooltipOption, XAXisOption, YAXisOption} from "echarts/types/dist/shared";
import React, {useState} from "react";
import {Card, CircularProgress, Stack, useTheme} from "@mui/material";
import Typography from "@mui/material/Typography";
import basicStyle from "./basic.module.css";
import {Queries} from "../RemoteCharts/queries";
import {RemoteData} from "../RemoteCharts/hook";
import Box from "@mui/material/Box";

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
  title?: string;
  shouldLoad?: boolean;
  noLoadReason?: string;
  loading?: boolean;
  error?: any;
  height: string;
  children: any;
  query?: keyof Queries;
  datas: [RemoteData<any, any> | undefined, RemoteData<any, any> | undefined];
  hideTitle?: boolean;
}

export default function CompareCard({
                                    loading = false, error = false, shouldLoad = true, hideTitle = false,
                                    title, height = "100px", noLoadReason, children, query, datas
                                  }: BaseCardProps) {
  const theme = useTheme();

  return <>
    <Box className={basicStyle.basicCard} sx={{ mt: 2 }}>
      {
        (title && !hideTitle) && <Stack className={basicStyle.basicCardHeader} direction="row" justifyContent="center" alignItems="center">
          <span
            className={basicStyle.basicCardTitle}
            style={{
              color: theme.palette.text.secondary
            }}
          >
            {title}
          </span>
        </Stack>
      }
      {
        (!shouldLoad || loading || error) ?
          <Stack direction="column" justifyContent="center" alignItems="center" style={{height: height}}>
            {
              loading && <CircularProgress size="1.5em"/>
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
    </Box>
  </>
}
