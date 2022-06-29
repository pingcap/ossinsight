import React from 'react';
import GeneralSearch from '../../components/GeneralSearch';
import CustomPage from '../../theme/CustomPage';
import OverviewSection from "./sections/0-Overview";
import BehaviourSection from "./sections/1-Behaviour";
import { AnalyzeUserContextProps, AnalyzeUserContextProvider } from "./charts/context";
import { useRouteMatch } from "@docusaurus/router";
import { useUser } from "../../api";
import Container from "@mui/material/Container";
import { registerThemeDark, registerThemeVintage } from "../../components/BasicCharts";

registerThemeDark()

const Page = () => {

  const { login, userId } = useAnalyzingUser();

  return (
    <CustomPage>
      <AnalyzeUserContextProvider value={{ login, userId }}>
        <Container maxWidth="lg">
          <OverviewSection />
          <BehaviourSection />
        </Container>
      </AnalyzeUserContextProvider>
    </CustomPage>
  );
};

interface AnalyzeUserPageParams {
  login: string;
}

function useAnalyzingUser(): AnalyzeUserContextProps {
  let { params: { login } } = useRouteMatch<AnalyzeUserPageParams>();

  const { data } = useUser(login);

  return {
    login,
    userId: data?.id,
  };
}

export default Page;
