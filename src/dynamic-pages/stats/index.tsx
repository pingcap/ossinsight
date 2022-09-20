import React from "react";
import CustomPage from '../../theme/CustomPage';
import IndexStats from "./components/IndexStats";
import { TidbIndexStats } from "@ossinsight/api";
import { useRemoteData } from "../../components/RemoteCharts/hook";
import Container from "@mui/material/Container";


export default function Page() {
  const { data } = useRemoteData<{}, TidbIndexStats>('stats-indexes-usage', undefined, false, true);
  return (
    <CustomPage title='Stats'>
      <Container maxWidth="lg">
        <IndexStats showTable stats={data?.data ?? []} />
      </Container>
    </CustomPage>
  );
}
