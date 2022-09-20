import React, { useMemo, useState } from "react";
import CustomPage from "../../../theme/CustomPage";
import { useRouteMatch } from "@docusaurus/router";
import { useRemoteData } from "../../../components/RemoteCharts/hook";
import { TidbIndexInfo, TidbIndexStats, TidbTableDDL, TidbTableInfo } from "@ossinsight/api";
import IndexStats from "../components/IndexStats";
import CodeBlock from "@theme/CodeBlock";
import Container from "@mui/material/Container";
import IndexInfo from "../components/IndexInfo";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TableInfo from "../components/TableInfo";
import { AxiosError } from "axios";
import NotFound from "../../../theme/NotFound";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";


interface TableStatsPageParams {
  slug: string;
}

type QueryParams = {
  tableName: string
}

type TabKey = 'ddl' | 'index-info' | 'index-usage'

export default function Page() {
  const { params: { slug } } = useRouteMatch<TableStatsPageParams>();
  const [current, setCurrent] = useState<TabKey>('index-usage');
  const {
    data: tableInfoData,
    error,
  } = useRemoteData<QueryParams, TidbTableInfo>('stats-table-info', { tableName: slug }, false, true);


  const notFound = useMemo(() => {
    return (error as AxiosError)?.response.data?.errno === 1146;
  }, [error]);

  if (notFound) {
    return <NotFound />;
  }

  return (
    <CustomPage title={`Stats - ${slug}`}>
      <Container maxWidth="lg">
        <Typography variant="h1" my={2}>{slug}</Typography>
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

function IndexUsageTab({ slug }: TableStatsPageParams) {
  const { data: indexUsageData } = useRemoteData<QueryParams, TidbIndexStats>('stats-index-usage', { tableName: slug }, false, true);
  return <IndexStats stats={indexUsageData?.data ?? []} />;
}

function IndexInfoTab({ slug }: TableStatsPageParams) {
  const { data: indexInfoData } = useRemoteData<QueryParams, TidbIndexInfo>('stats-index-info', { tableName: slug }, false, true);
  return <IndexInfo infos={indexInfoData?.data ?? []} />;
}

function DdlTab({ slug }: TableStatsPageParams) {
  const { data: ddlData } = useRemoteData<QueryParams, TidbTableDDL>('stats-table-ddl', { tableName: slug }, false, true);
  const ddl = useMemo(() => {
    return ddlData?.data[0]["Create Table"];
  }, [ddlData]);
  return ddl ? <CodeBlock className="language-sql">{ddl}</CodeBlock> : null;
}