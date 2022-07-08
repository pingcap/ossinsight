import React, { useState } from "react";
import CustomPage from "../../theme/CustomPage";
import SearchCompany from "./_components/SearchCompany";
import Companies from "./_components/Companies";
import Container from "@mui/material/Container";
import { CompanyInfo } from "./_components/hooks";

const Page = () => {
  const [company, setCompany] = useState<CompanyInfo>(null)

  return (
    <CustomPage>
      <Container maxWidth="lg">
        <SearchCompany value={company} onChange={setCompany} />
        <Companies name={company?.name ?? null} />
      </Container>
    </CustomPage>
  )
}

export default Page
