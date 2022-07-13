import React, { useRef } from 'react';
import CustomPage from '../../theme/CustomPage';
import OverviewSection from "./sections/0-Overview";
import BehaviourSection from "./sections/1-Behaviour";
import StarSection from "./sections/2-Star";
import CodeSection from "./sections/3-Code";
import CodeReviewSection from "./sections/4-CodeReview";
import IssueSection from "./sections/5-Issue";
import ActivitiesSection from "./sections/6-Activities";
import { AnalyzeUserContextProps, AnalyzeUserContextProvider } from "./charts/context";
import Container from "@mui/material/Container";
import { registerThemeDark } from "../../components/BasicCharts";
import { Navigator } from "./Navigator";
import { Scrollspy } from '@makotot/ghostui';
import { useMediaQuery } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { Redirect, useRouteMatch } from "@docusaurus/router";
import { useUser } from "../../api";

registerThemeDark();

const sections = [
  'overview',
  'behaviour',
  'star',
  'code',
  'code-review',
  'issue',
  'activities',
];

const Page = () => {

  const { login, userId, loading, error } = useAnalyzingUser();
  const sectionRefs = sections.map(section => useRef<HTMLElement>(null));
  const isSmall = useMediaQuery<Theme>('(max-width:600px)');
  const sideWidth = isSmall ? undefined : '160px'

  if (error) {
    return <Redirect to='/404' />
  }

  return (
    <Scrollspy sectionRefs={sectionRefs} offset={-140}>
      {({ currentElementIndexInViewport }) => (
        <CustomPage Side={() => isSmall ? undefined : <Navigator value={sections[currentElementIndexInViewport]} type="side" />} sideWidth={sideWidth}>
          <AnalyzeUserContextProvider value={{ login, userId, loading, error }}>
            <Container maxWidth="lg">
              <OverviewSection ref={sectionRefs[0]} />
              <BehaviourSection ref={sectionRefs[1]} />
              <StarSection ref={sectionRefs[2]} />
              <CodeSection ref={sectionRefs[3]} />
              <CodeReviewSection ref={sectionRefs[4]} />
              <IssueSection ref={sectionRefs[5]} />
              <ActivitiesSection ref={sectionRefs[6]} />
            </Container>
            {isSmall ? <Navigator value={sections[currentElementIndexInViewport]} type="bottom" /> : undefined}
          </AnalyzeUserContextProvider>
        </CustomPage>
      )}
    </Scrollspy>
  );
};

interface AnalyzeUserPageParams {
  login: string;
}

function useAnalyzingUser(): AnalyzeUserContextProps {
  let { params: { login } } = useRouteMatch<AnalyzeUserPageParams>();

  const { data, isValidating, error } = useUser(login);

  return {
    login,
    userId: data?.id,
    loading: isValidating,
    error,
  };
}

export default Page;
