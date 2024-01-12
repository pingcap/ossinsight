import React, { useMemo, useState } from 'react';
import CustomPage from '../../../theme/CustomPage';
import { useRouteMatch } from 'react-router';
import { useRemoteData } from '../../../components/RemoteCharts/hook';
import { TidbIndexInfo, TidbIndexStats, TidbTableDDL, TidbTableInfo } from '@ossinsight/api';
import IndexStats from '../components/IndexStats';
import CodeBlock from '@theme/CodeBlock';
import IndexInfo from '../components/IndexInfo';
import TableInfo from '../components/TableInfo';
import NotFound from '../../../theme/NotFound';
import { useInterval } from '../components/useInterval';
import Link from '@docusaurus/Link';

import { Container, Tabs, Tab, Box, Breadcrumbs } from '@mui/material';

interface TableStatsPageParams {
  slug: string;
}

type QueryParams = {
  tableName: string;
};

type TabKey = 'ddl' | 'index-info' | 'index-usage';

export default function Page () {
  const { params: { slug } } = useRouteMatch<TableStatsPageParams>();
  const [current, setCurrent] = useState<TabKey>('index-usage');
  const { data: tableInfoData } = useRemoteData<QueryParams, TidbTableInfo>('stats-table-info', { tableName: slug }, false, true);

  const notFound = useMemo(() => {
    return tableInfoData?.data.length === 0;
  }, [tableInfoData]);

  if (notFound) {
    return <NotFound />;
  }

  return (
    <CustomPage title={`Stats - ${slug}`}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ my: 2 }}>
          <Link to="/stats">Stats</Link>
          <span>Tables</span>
          <span>{slug}</span>
        </Breadcrumbs>
        <TableInfo info={tableInfoData?.data[0]} />
        <Tabs onChange={(_, value) => setCurrent(value)} value={current} sx={{ mt: 2 }}>
          <Tab label="Index Usage" value="index-usage" />
          <Tab label="Index Info" value="index-info" />
          <Tab label="DDL" value="ddl" />
        </Tabs>
        {current === 'index-usage' ? <IndexUsageTab slug={slug} /> : undefined}
        {current === 'index-info' ? <IndexInfoTab slug={slug} /> : undefined}
        {current === 'ddl' ? <DdlTab slug={slug} /> : undefined}
        <Box height={16} />
      </Container>
    </CustomPage>
  );
}

function IndexUsageTab ({ slug }: TableStatsPageParams) {
  const {
    data: indexUsageData,
    reload,
  } = useRemoteData<QueryParams, TidbIndexStats>('stats-index-usage', { tableName: slug }, false, true, 'unique');
  useInterval(reload, 1000);
  return <IndexStats stats={indexUsageData?.data ?? []} />;
}

function IndexInfoTab ({ slug }: TableStatsPageParams) {
  const { data: indexInfoData } = useRemoteData<QueryParams, TidbIndexInfo>('stats-index-info', { tableName: slug }, false, true);
  return <IndexInfo infos={indexInfoData?.data ?? []} />;
}

function DdlTab ({ slug }: TableStatsPageParams) {
  const { data: ddlData } = useRemoteData<QueryParams, TidbTableDDL>('stats-table-ddl', { tableName: slug }, false, true);
  const ddl = useMemo(() => {
    return ddlData?.data[0]['Create Table'];
  }, [ddlData]);
  return ddl ? <CodeBlock className="language-sql">{ddl}</CodeBlock> : null;
}
