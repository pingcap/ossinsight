import React, { useCallback, useMemo, useRef, useState } from 'react';
import CustomPage from '../../theme/CustomPage';
import OverviewSection from './sections/0-Overview';
import BehaviourSection from './sections/1-Behaviour';
import StarSection from './sections/2-Star';
import CodeSection from './sections/3-Code';
import CodeReviewSection from './sections/4-CodeReview';
import IssueSection from './sections/5-Issue';
import ActivitiesSection from './sections/6-Activities';
import { AnalyzeUserContextProps, AnalyzeUserContextProvider } from './charts/context';
import { Navigator } from './Navigator';
import { Container, Theme, useMediaQuery } from '@mui/material';
import { Redirect } from '@docusaurus/router';
import { useRouteMatch } from 'react-router';
import { useUser } from '../../api';
import { notNullish } from '@site/src/utils/value';
import ScrollSpy, { ScrollSpyInstance } from '@site/src/components/ScrollSpy';

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
  const sideWidth = isSmall ? undefined : '160px';

  const [active, setActive] = useState(0);
  const ref = useRef<ScrollSpyInstance | null>(null);
  const scrollTo = useCallback((key: string) => {
    const spy = ref.current;
    if (spy) {
      spy.scrollTo(sections.indexOf(key));
    }
  }, []);

  const content = useMemo(() => (
    <Container maxWidth="lg">
      <ScrollSpy ref={ref} offset={140} onVisibleElementChange={setActive}>
        <OverviewSection ref={sectionRefs[0]} key={sections[0]} />
        <BehaviourSection ref={sectionRefs[1]} key={sections[1]} />
        <StarSection ref={sectionRefs[2]} key={sections[2]} />
        <CodeSection ref={sectionRefs[3]} key={sections[3]} />
        <CodeReviewSection ref={sectionRefs[4]} key={sections[4]} />
        <IssueSection ref={sectionRefs[5]} key={sections[5]} />
        <ActivitiesSection ref={sectionRefs[6]} key={sections[6]} />
      </ScrollSpy>
    </Container>
  ), []);

  if (notNullish(error)) {
    return <Redirect to="/404" />;
  }

  return (
    <CustomPage Side={() => isSmall ? null : <Navigator value={sections[active]} type="side" scrollTo={scrollTo} />} sideWidth={sideWidth}>
      <AnalyzeUserContextProvider value={{ login, userId, loading, error }}>
        {content}
        {isSmall ? <Navigator value={sections[active]} type="bottom" scrollTo={scrollTo} /> : undefined}
      </AnalyzeUserContextProvider>
    </CustomPage>

  );
};

interface AnalyzeUserPageParams {
  login: string;
}

function useAnalyzingUser (): AnalyzeUserContextProps {
  const { params: { login } } = useRouteMatch<AnalyzeUserPageParams>();

  const { data, isValidating, error } = useUser(login);

  return {
    login,
    userId: data?.id,
    loading: isValidating,
    error,
  };
}

export default Page;
