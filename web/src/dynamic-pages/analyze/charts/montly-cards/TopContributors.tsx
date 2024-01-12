import React from 'react';
import PeopleIcon from '@mui/icons-material/People';
import { useAnalyzeChartContext } from '../context';
import { Typography, Stack, Avatar, Link, Tooltip } from '@mui/material';

export default function TopContributors () {
  const { data } = useAnalyzeChartContext();
  return (
    <Stack direction={['column', 'column', 'column', 'row']} justifyContent="space-between" alignItems="center">
      <Typography fontSize={16} fontWeight="bold" whiteSpace="nowrap">
        <PeopleIcon sx={{ verticalAlign: 'middle', mr: 0.5 }} />
        Top 5 Contributors
      </Typography>
      <Stack direction="row" mt={[1, 1, 1, 0]}>
        {(data.data?.data ?? []).map(({ actor_login: actorLogin }) => (
          <Contributor key={actorLogin} login={actorLogin} />
        ))}
      </Stack>
    </Stack>
  );
}

const Contributor = ({ login }: { login: string }) => {
  return (
    <Link href={`https://github.com/${login}`} target="_blank">
      <Tooltip title={login}>
        <Avatar src={`https://github.com/${login}.png`} sx={{ ml: 1 }} />
      </Tooltip>
    </Link>
  );
};
