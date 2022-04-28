import * as React from "react";
import {useRemoteData} from "../RemoteCharts/hook";
import Typography from '@mui/material/Typography';
import {useEffect, useState} from "react";
import {CardContent, Stack, Tooltip, useTheme} from "@mui/material";
import basicStyle from './basic.module.css';
import BasicCard, {BaseChartCardProps} from "./BasicCard";
import {formatNumber} from '../../lib/text';
import useThemeContext from "@theme/hooks/useThemeContext";

interface StatisticCardProps extends BaseChartCardProps {
}

export default function StatisticCard(props: StatisticCardProps) {
  const {queryName, params, title, height, shouldLoad} = props;
  const {data: res, loading, error} = useRemoteData(queryName, params, true, shouldLoad);
  const [value, setValue] = useState<any>();
  const {isDarkTheme} = useThemeContext();
  const theme = useTheme();

  useEffect(() => {
    const firstRow = res?.data[0]
    if (firstRow !== undefined) {
      const columnNames = Object.keys(firstRow);
      const firstItem = firstRow[columnNames[0]];
      if (firstItem !== undefined) {
        setValue(firstItem);
      }
    }
  }, [res]);

  return <>
    <BasicCard {...props} loading={loading} error={error} query={queryName} data={res} hideTitle={true}>
      <CardContent style={{height: height}}>
        <Stack direction="column" justifyContent="center" alignItems="center" style={{height: "100%"}}>
          <Tooltip title={value ? value : 0}>
            <Typography
              variant="h3"
              component="div"
              fontFamily="Lato"
              fontWeight={900}
              color={isDarkTheme ? '#f5f6f7' : '#4d5771'}
            >
              {value ? formatNumber(value, 2) : 0}
            </Typography>
          </Tooltip>
          <span
            className={basicStyle.basicCardTitle}
            style={{
              color: theme.palette.text.secondary
            }}
          >
            {title}
          </span>
        </Stack>
      </CardContent>
    </BasicCard>
  </>;
}
