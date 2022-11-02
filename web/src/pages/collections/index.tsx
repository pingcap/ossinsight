import React from 'react';
import Container from '@mui/material/Container';
import CustomPage from '../../theme/CustomPage';
import WordCloud from './_components/WordCloud';
import Collections from './_components/Collections';
import { useSearch, useSorter } from './_components/filters';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import Link from '@docusaurus/Link';

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
        <Stack direction="row" justifyContent="space-between" alignItems="center" my={2}>
          {Sorter}
          {Search}
        </Stack>
        <Collections sorter={sorter} search={search} />
        <Typography variant="body1" align="center" mt={2}>
          Not interested in a collection?
          <Button component={Link} rel='noopener' href='https://github.com/pingcap/ossinsight#how-to-add-collections' sx={{ ml: 1 }} variant='contained' color="primary" startIcon={<AddIcon />}>
            Add a Collection
          </Button>
        </Typography>
      </Container>
    </CustomPage>
  );
};

export default Page;
