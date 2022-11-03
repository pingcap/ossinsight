import React, { useState } from 'react';
import CustomPage from '../../theme/CustomPage';
import IndexStats from './components/IndexStats';
import { TidbIndexStats } from '@ossinsight/api';
import { useRemoteData } from '../../components/RemoteCharts/hook';
import { useInterval } from './components/useInterval';
import LiveSql from './components/LiveSql';
import { Container, Typography, Tab, Tabs } from '@mui/material';

type TabKey = 'live-sql' | 'index-usage';

export default function Page () {
  const [current, setCurrent] = useState<TabKey>('live-sql');

  return (
    <CustomPage title="Stats">
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Typography variant="h1" mb={2}>
          Database Stats
        </Typography>
        <Tabs onChange={(_, value) => setCurrent(value)} value={current} sx={{ mb: 2 }}>
          <Tab label="Process List" value="live-sql" />
          <Tab label="Index Usage" value="index-usage" />
        </Tabs>
        {current === 'live-sql' && <LiveSqlTab />}
        {current === 'index-usage' && <IndexUsageTab />}
      </Container>
    </CustomPage>
  );
}

function LiveSqlTab () {
  return <LiveSql />;
}

function IndexUsageTab () {
  const { data, reload } = useRemoteData<undefined, TidbIndexStats>('stats-indexes-usage', undefined, false, true, true);
  useInterval(reload, 1000);

  return <IndexStats showTable stats={data?.data ?? []} />;
}
