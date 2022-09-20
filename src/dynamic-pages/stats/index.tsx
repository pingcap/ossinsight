import React from "react";
import CustomPage from '../../theme/CustomPage';
import IndexStats from "./components/IndexStats";
import { TidbIndexStats } from "@ossinsight/api";
import { useRemoteData } from "../../components/RemoteCharts/hook";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";


export default function Page() {
  const { data } = useRemoteData<{}, TidbIndexStats>('stats-indexes-usage', undefined, false, true);
  return (
    <CustomPage title="Stats">
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Typography variant='h1' mb={2}>
          Index Usage
        </Typography>
        <IndexStats showTable stats={data?.data ?? []} />
      </Container>
    </CustomPage>
  );
}
