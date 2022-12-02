import React from 'react';
import CustomPage from '../../theme/CustomPage';
import WordCloud from './_components/WordCloud';
import Collections from './_components/Collections';
import { useSearch, useSorter } from './_components/filters';
import Link from '@docusaurus/Link';

import { Container, IconButton, Stack, styled, Tooltip, Typography } from '@mui/material';
import { AddRounded } from '@mui/icons-material';

const title = 'Explore Collections';
const description = 'Find insights about the monthly or historical rankings and trends in technical fields with curated repository lists.';
const Page = () => {
  const [sorter, Sorter] = useSorter();
  const [search, Search] = useSearch();

  return (
    <CustomPage title={title} description={description}>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h1" fontSize={28} mb={2} align="center">
          {title}
        </Typography>
        <Typography variant="body1" fontSize={16} mb={2} align="center">
          {description}
        </Typography>
        <WordCloud />
        <Stack direction="row" justifyContent="space-between" alignItems="center" my={2} flexWrap="wrap">
          {Sorter}
          <Spacer />
          <Tooltip title="Request to add a Collection">
            <IconButton component={Link} rel="noopener" href="https://github.com/pingcap/ossinsight#how-to-add-collections" sx={{ mr: 1 }} color="primary">
              <AddRounded />
            </IconButton>
          </Tooltip>
          {Search}
        </Stack>
        <Collections sorter={sorter} search={search} />
      </Container>
    </CustomPage>
  );
};

const Spacer = styled('span')`
  flex: 1;
`;

export default Page;
