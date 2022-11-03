import React, { useState } from 'react';
import CustomPage from '../../theme/CustomPage';
import SearchCompany from './_components/SearchCompany';
import Companies from './_components/Companies';
import { CompanyInfo } from './_components/hooks';
import { Container, Typography } from '@mui/material';

const Page = () => {
  const [company, setCompany] = useState<CompanyInfo | null>(null);

  return (
    <CustomPage>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant='h1' align='center'>🏛️  Company Analytics [Beta]</Typography>
        <Typography variant='body1' align='center' mt={2} mb={6}>
          Contribution analytics of developers within the same company
        </Typography>
        <SearchCompany value={company} onChange={setCompany} />
        <Typography variant='body2' align='center' mt={2} mb={6}>
          Hints: Only the statistics of the members who have the data of [company name] was recorded and the result may include all events in both previous/current company. Contributions include pushes, pull requests, pull request reviews, pull request review comments, issues and issue comments.
        </Typography>
        <Companies company={company} />
      </Container>
    </CustomPage>
  );
};

export default Page;
