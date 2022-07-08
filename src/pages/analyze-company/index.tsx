import React, { useState } from "react";
import CustomPage from "../../theme/CustomPage";
import SearchCompany from "./_components/SearchCompany";
import Companies from "./_components/Companies";
import Container from "@mui/material/Container";
import { CompanyInfo } from "./_components/hooks";
import Typography from "@mui/material/Typography";

const Page = () => {
  const [company, setCompany] = useState<CompanyInfo>(null)

  return (
    <CustomPage>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant='h1' align='center'>🌟 Company Analytics</Typography>
        <Typography variant='body1' align='center' mt={2} mb={6}>
          Check the contribution behaviour of developers in different repositories within the same company name includes pushes, pull requests, pull request reviews, pull request review comments, issues and issue comments.
        </Typography>
        <SearchCompany value={company} onChange={setCompany} />
        <Typography variant='body2' align='center' mt={2} mb={6}>
          Hints: Only the statistics of the members who have the data of [company name] was recorded and the result may including all events in both previous/current company name.
        </Typography>
        <Companies company={company} />
      </Container>
    </CustomPage>
  )
}

export default Page
