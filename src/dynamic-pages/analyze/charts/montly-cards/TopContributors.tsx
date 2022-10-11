import Typography from "@mui/material/Typography";
import React from "react";
import Stack from "@mui/material/Stack";
import PeopleIcon from '@mui/icons-material/People';
import { useAnalyzeChartContext } from "../context";
import Avatar from "@mui/material/Avatar";
import Link from "@mui/material/Link";

export default function TopContributors() {
  const { data } = useAnalyzeChartContext();
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography fontSize={16} fontWeight="bold" whiteSpace="nowrap">
        <PeopleIcon sx={{ verticalAlign: 'middle', mr: 0.5 }} />
        Top 5 Contributors
      </Typography>
      <Stack direction="row">
        {(data.data?.data ?? []).map(({ actor_login }) => (
          <Link href={`https://github.com/${actor_login}`} target="_blank">
            <Avatar src={`https://github.com/${actor_login}.png`} sx={{ ml: 1 }} />
          </Link>
        ))}
      </Stack>
    </Stack>
  );

}