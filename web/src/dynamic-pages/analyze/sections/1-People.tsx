import { GitMergeIcon, IssueOpenedIcon, PersonIcon, StarIcon } from '@primer/octicons-react';
import React, {
  ForwardedRef,
  forwardRef,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect, useMemo, useRef,
  useState,
} from 'react';
import Analyze from '../charts/Analyze';
import { CompaniesChart } from '../charts/companies';
import { AnalyzeChartContext, useAnalyzeContext } from '../charts/context';
import List from '../charts/list/List';
import { WorldMapChart } from '../charts/worldmap';
import { alpha2ToTitle } from '../../../lib/areacode';
import Section from '../Section';
import styles from '../styles.module.css';
import { H2, H3, H4, P2 } from '../typography';
import { notNullish } from '@site/src/utils/value';

import { Box, Grid, Tab, Tabs } from '@mui/material';

export const PeopleSection = forwardRef(function (_, ref: ForwardedRef<HTMLElement>) {
  const { comparingRepoId: vs, comparingRepoName } = useAnalyzeContext();

  // hooks for sections
  const [mapType, setMapType] = useState('analyze-stars-map');
  const handleChangeMapType = useCallback((event: React.SyntheticEvent, value: string) => {
    setMapType(value);
  }, []);

  const params = useMemo(() => {
    if (mapType === 'analyze-stars-map') {
      return { period: 'all_times' };
    } else {
      return undefined;
    }
  }, [mapType]);

  const [companyType, setCompanyType] = useState('analyze-stars-company');
  const handleChangeCompanyType = useCallback((event: React.SyntheticEvent, value: string) => {
    setCompanyType(value);
  }, []);

  return (
    <Section id='people' ref={ref}>
      <H2>People</H2>
      <Analyze query={mapType} params={params}>
        <H3 sx={{ mt: 6 }}>Geographical Distribution</H3>
        <P2>Stargazers, Issue creators, and Pull Request creators’ geographical distribution around the world (analyzed with the public GitHub information).</P2>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={mapType} onChange={handleChangeMapType} variant='scrollable' scrollButtons='auto' allowScrollButtonsMobile>
            <IconTab defaultTab id='geo-distribution-stargazers' value='analyze-stars-map' icon={<StarIcon size={24} />}><span style={{ display: 'none' }}>Geographical Distribution of </span>Stargazers</IconTab>
            <IconTab id='geo-distribution-issue-creators' value='analyze-issue-creators-map' icon={<IssueCreatorIcon size={24} />}><span style={{ display: 'none' }}>Geographical Distribution of </span>Issue Creators</IconTab>
            <IconTab id='geo-distribution-pr-creators' value='analyze-pull-request-creators-map' icon={<PrCreatorIcon size={24} />}><span style={{ display: 'none' }}>Geographical Distribution of </span>Pull Requests Creators</IconTab>
          </Tabs>
        </Box>
        <Grid container alignItems='center'>
          <Grid item xs={12} md={notNullish(vs) ? 8 : 9}>
            <WorldMapChart aspectRatio={3 / 2} />
          </Grid>
          <Grid item xs={12} md={notNullish(vs) ? 4 : 3}>
            <List title='Geo-Locations' n={10} /* valueIndex='count' */ nameIndex='country_or_area' percentIndex='percentage' transformName={alpha2ToTitle} />
          </Grid>
        </Grid>
      </Analyze>
      <Analyze query={companyType} params={{ limit: comparingRepoName ? 25 : 50 }}>
        <H3 sx={{ mt: 6 }}>Companies</H3>
        <P2>Company information about Stargazers, Issue creators, and Pull Request creators (analyzed with the public GitHub information).</P2>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={companyType} onChange={handleChangeCompanyType} variant='scrollable' scrollButtons='auto' allowScrollButtonsMobile>
            <IconTab defaultTab id='companies-stargazers' value='analyze-stars-company' icon={<StarIcon />}>Stargazers<span style={{ display: 'none' }}>&apos; Companies</span></IconTab>
            <IconTab id='companies-issue-creators' value='analyze-issue-creators-company' icon={<IssueCreatorIcon size={24} />}>Issue Creators<span style={{ display: 'none' }}>&apos; Companies</span></IconTab>
            <IconTab id='companies-pr-creators' value='analyze-pull-request-creators-company' icon={<PrCreatorIcon size={24} />}>Pull Requests Creators<span style={{ display: 'none' }}>&apos; Companies</span></IconTab>
          </Tabs>
        </Box>
        <Grid container alignItems='center'>
          <Grid item xs={12} md={notNullish(vs) ? 8 : 9}>
            <CompaniesChart spec={{ valueIndex: companyValueIndices[companyType] }} aspectRatio={3 / 2} />
          </Grid>
          <Grid item xs={12} md={notNullish(vs) ? 4 : 3}>
            <List title='Companies' n={10} /* valueIndex={companyValueIndices[companyType]} */ nameIndex='company_name' percentIndex='proportion' />
          </Grid>
        </Grid>
      </Analyze>
    </Section>
  );
});

const IconTab = ({ children, id, icon, defaultTab, ...props }: PropsWithChildren<{ id: string, value: string, icon?: React.ReactNode, defaultTab?: boolean }>) => {
  const { headingRef } = useContext(AnalyzeChartContext);
  const handleClick = useCallback((event: React.MouseEvent<HTMLHeadingElement>) => {
    headingRef?.(event.currentTarget);
  }, []);
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (defaultTab) {
      if (notNullish(ref.current)) {
        headingRef?.(ref.current);
      }
    }
  }, []);

  return (
    <Tab
      {...props}
      sx={{ textTransform: 'unset' }}
      label={(
        <H4 id={id} ref={ref} onClick={handleClick}>
          {icon}
          &nbsp;
          {children}
        </H4>
      )}
    />
  );
};

const IssueCreatorIcon = ({ size }: { size: number }) => (
  <Box display='inline-block' position='relative'>
    <PersonIcon size={size} />
    <IssueOpenedIcon size={size / 3} className={styles.subIcon} />
  </Box>
);

const PrCreatorIcon = ({ size }: { size: number }) => (
  <Box display='inline-block' position='relative'>
    <PersonIcon size={size} />
    <GitMergeIcon size={size / 3} className={styles.subIcon} />
  </Box>
);

const companyValueIndices = {
  'analyze-stars-company': 'stargazers',
  'analyze-issue-creators-company': 'issue_creators',
  'analyze-pull-request-creators-company': 'code_contributors',
};
