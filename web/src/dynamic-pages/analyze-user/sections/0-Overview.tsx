import React, { ForwardedRef, forwardRef, ReactNode, useContext, useMemo, useRef } from 'react';
import Section, { SectionHeading } from '../../../components/Section';
import { useAnalyzeUserContext } from '../charts/context';
import { contributionTypes, PersonalOverview, usePersonalData, usePersonalOverview } from '../hooks/usePersonal';
import InViewContext from '../../../components/InViewContext';
import {
  CodeReviewIcon,
  GitPullRequestIcon,
  IssueOpenedIcon,
  MarkGithubIcon, RepoIcon,
  StarIcon,
} from '@primer/octicons-react';
import Link from '@docusaurus/Link';
import { EChartsx } from '@site/src/components/ECharts';
import { Axis, Dataset, LineSeries, Once, Title } from '@djagger/echartsx';
import colors from '../colors.module.css';
import { chartColors, languageColors } from '../colors';
import { Common } from '../charts/Common';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useDimension } from '../hooks/useDimension';
import ChartWrapper from '../charts/ChartWrapper';
import { EChartsType } from 'echarts/core';
import { isNullish, notNullish } from '@site/src/utils/value';

import { Stack, Avatar, Typography, styled, Box, Skeleton, Tooltip } from '@mui/material';

export default forwardRef(function OverviewSection (_, ref: ForwardedRef<HTMLElement>) {
  return (
    <Section id='overview' ref={ref}>
      <Overview />
    </Section>
  );
});

const Overview = () => {
  const { login, userId } = useAnalyzeUserContext();
  const { inView } = useContext(InViewContext);

  return (
    <>
      <Banner login={login} />
      <Stack direction={['column', 'column', 'row']} alignItems="center" sx={{ mt: 4 }} gap={4}>
        <Box flex={1}>
          <SectionHeading
            title="Overview"
            description={(
              <>
                All results are calculated only by developer&apos;s <b>public activities</b> showed on GitHub. See details in <Link href='https://gharchive.org' target='_blank'>gharchive</Link>!
              </>
            )}
          />
          <OverviewTable userId={userId} login={login} show={inView} />
          <Languages login={login} userId={userId} show={inView} />
        </Box>
        <Box flex={1} width="100%">
          <ContributorTrends login={login} userId={userId} show={inView} />
        </Box>
      </Stack>

    </>
  );
};

type ModuleProps = {
  login: string;
  userId?: number;
  show: boolean;
};

const Banner = ({ login }: { login: string }) => {
  return (
    <Stack direction="row" alignItems="center" justifyContent="flex-start" divider={<CustomDivider />}>
      <Avatar src={`https://github.com/${login}.png`} sx={{ width: 72, height: 72 }} />

      <Stack alignItems="flex-start" justifyContent="space-around">
        <Typography variant="h3" component="h1">{login}</Typography>
        <Stack direction="row" alignItems="center" justifyContent="flex-start" sx={{ mt: 1 }}>
          <MarkGithubIcon />
          <Link href={`https://github.com/${login}`} target="_blank" style={{ marginLeft: 8 }}>
            {`https://github.com/${login}`}
          </Link>
        </Stack>
      </Stack>
    </Stack>
  );
};

type OverviewItemProps = {
  field?: keyof PersonalOverview;
  icon: ReactNode;
  name: string;
  children?: (value: any, data: PersonalOverview) => React.ReactNode;
  tooltip?: string;
  dataColSpan?: number;
};

const OverviewTable = ({ userId, show }: ModuleProps) => {
  const { data } = usePersonalOverview(userId, notNullish(userId) && show);

  const OverviewItem = useMemo(() => {
    return ({ field, icon, name, tooltip, dataColSpan, children }: OverviewItemProps) => {
      let tooltipEl: ReactNode;

      if (tooltip) {
        tooltipEl = (
          <Tooltip title={tooltip} arrow>
            <InfoOutlinedIcon fontSize='small' htmlColor='#535353' sx={{ verticalAlign: 'text-bottom' }} />
          </Tooltip>
        );
      }
      return (
        <Pair data={data} name={field} renderValue={children} dataColSpan={dataColSpan}>
          {icon} {name} {tooltipEl}
        </Pair>
      );
    };
  }, [data]);

  return (
    <table style={{ marginTop: 16, width: '100%', display: 'table' }}>
      <colgroup>
        <col />
        <col />
        <col />
        <col />
      </colgroup>
      <thead />
      <tbody>
      <Tr>
        <OverviewItem
          field="star_repos"
          name="Starred Repos"
          icon={<StarIcon className={colors.orange} />}
          tooltip="We only display the total number of stars and ignore developers' unstarring or restarring behaviors."
        />
        <OverviewItem
          field="star_earned"
          name="Star Earned"
          icon={<StarIcon className={colors.orange} />}
          tooltip="We calculate the total number of stars earned in public repositories owned by the individual developer(without developers' unstarring or restarring behaviors)."
        />
      </Tr>
      <Tr>
        <OverviewItem
          field="contribute_repos"
          name="Contributed to"
          icon={<RepoIcon className={colors.purple} />}
        />
        <OverviewItem
          field="issues"
          name="Issues"
          icon={<IssueOpenedIcon className={colors.primary} />}
        />
      </Tr>
      <Tr>
        <OverviewItem
          field="pull_requests"
          name="Pull Requests"
          icon={<GitPullRequestIcon className={colors.red} />}
        />
        <OverviewItem
          field="code_reviews"
          name="Code Reviews"
          icon={<CodeReviewIcon className={colors.blue} />}
        />
      </Tr>
      <Tr>
        <OverviewItem
          name="PR Code Changes"
          icon={<GitPullRequestIcon className={colors.red} />}
          tooltip="Here is the code line changes in pull requests."
          dataColSpan={2}
        >
          {(value, data: PersonalOverview) => (
            <>
              <Addition>+{data.code_additions}</Addition>
              &nbsp;
              /
              &nbsp;
              <Deletion>-{data.code_deletions}</Deletion>
            </>
          )}
        </OverviewItem>
      </Tr>
      </tbody>
    </table>
  );
};

const Languages = ({ userId, show }: ModuleProps) => {
  const { data } = usePersonalData('personal-languages', userId, show);

  if (isNullish(data)) {
    return <Skeleton />;
  }

  return (
    <Box mt={4}>
      <Typography variant="h3">
        Most Used Languages
        &nbsp;
        <Tooltip title="Here is the most used languages in pull requests." arrow>
          <InfoOutlinedIcon fontSize='small' htmlColor='#535353' sx={{ verticalAlign: 'text-bottom' }} />
        </Tooltip>
      </Typography>
      <Bar sx={{ mt: 2 }}>
        {data.data.slice(0, 4).map((lang, i) => (
          <Tick key={lang.language}
                sx={{ width: lang.percentage, backgroundColor: languageColors[i % languageColors.length] }}
          />
        ))}
      </Bar>
      <Stack sx={{ mt: 2 }} flexWrap="wrap" rowGap={2} columnGap={4} flexDirection="row">
        {data.data.slice(0, 4).map((lang, i) => (
          <DotText key={lang.language} color={languageColors[i % languageColors.length]} label={lang.language} percent={lang.percentage} />
        ))}
        {data.data.length > 4
          ? <DotText color='#3c3c3c' label='Others' percent={data.data.slice(4).reduce((total, last) => total + last.percentage, 0)}/>
          : undefined}
      </Stack>
    </Box>
  );
};

const ContributorTrends = ({ userId, show }: ModuleProps) => {
  const { data, loading } = usePersonalData('personal-contribution-trends', userId, show);
  const validContributionTypes = useDimension(data?.data ?? [], 'contribution_type');
  const chart = useRef<EChartsType>(null);

  return (
    <ChartWrapper title='Contribution Trends' remoteData={data} loading={loading} chart={chart}>
      <EChartsx init={{ height: 400, renderer: 'canvas' }} theme="dark" ref={chart}>
        <Once>
          <Title text="Contribution Trends" left="center" />
          <Common hideZoom />
          <Axis.Time.X />
          <Axis.Value.Y />
          {contributionTypes.map((ct, i) => (
            <LineSeries key={ct} name={ct} color={chartColors[i % chartColors.length]} datasetId={ct}
                        encode={{ x: 'event_month', y: 'cnt' }} symbolSize={0} lineStyle={{ width: 1 }}
                        areaStyle={{ opacity: 0.15 }} />
          ))}
        </Once>
        {validContributionTypes.map(ct => (
          <Dataset key={ct} id={ct} fromDatasetId="original"
                   transform={{ type: 'filter', config: { value: ct, dimension: 'contribution_type' } }} />
        ))}
        <Dataset id="original" source={data?.data ?? []} />
      </EChartsx>
    </ChartWrapper>
  );
};

const CustomDivider = styled('hr')({
  display: 'block',
  width: 1,
  maxWidth: 1,
  minWidth: 1,
  height: 72,
  margin: 0,
  padding: 0,
  border: 'none',
  background: '#3c3c3c',
  marginLeft: 16,
  marginRight: 16,
});

type PairProps = {
  data: PersonalOverview | undefined;
  name: keyof PersonalOverview | undefined;
  renderValue?: (value: any, data: PersonalOverview) => React.ReactNode;
  children: ReactNode;
  dataColSpan?: number;
};

const Pair = ({ children, name, data, renderValue = value => value, dataColSpan }: PairProps) => {
  const value = isNullish(name) ? data : data?.[name];
  return (
    <>
      <Td sx={{ color: '#C4C4C4' }}>{children}</Td>
      <Td colSpan={dataColSpan}>
        <b>
          {isNullish(data) ? <Skeleton width={24} sx={{ display: 'inline-block' }} /> : renderValue(value, data)}
        </b>
      </Td>
    </>
  );
};

const Tr = styled('tr')({
  backgroundColor: 'transparent !important',
  border: 0,
});

const Td = styled('td')({
  border: 0,
});

const Addition = styled('span')({
  color: '#57ab5a',
});

const Deletion = styled('span')({
  color: '#e5534b',
});

const Bar = styled('ol')({
  display: 'flex',
  height: 6,
  borderRadius: 3,
  overflow: 'hidden',
  margin: 0,
  padding: 0,
  listStyle: 'none',
  background: '#3c3c3c',
});

const Tick = styled('li')({
  display: 'inline',
  height: 6,
});

const DotText = ({ color, label, percent }: { color: string, label: string, percent: number }) => {
  return (
    <Stack alignItems="center" flexDirection="row">
      <Box component="span" display="block" bgcolor={color} width={6} height={6} borderRadius={3} mr={1} />
      <Typography component="span" variant="body2" color="#F9F9F9" fontWeight='bold'>{label}</Typography>
      &nbsp;
      <Typography component="span" variant="body2" color="#C4C4C4">{(percent * 100).toPrecision(2)}%</Typography>
    </Stack>
  );
};
