import React, { ForwardedRef, forwardRef, ReactNode, useContext } from "react";
import Section from "../../../components/Section";
import { useAnalyzeUserContext } from "../charts/context";
import {
  contributionTypes,
  Personal,
  PersonalOverview,
  usePersonalData,
  usePersonalOverview,
} from "../hooks/usePersonal";
import InViewContext from "../../../components/InViewContext";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { MarkGithubIcon } from "@primer/octicons-react";
import Link from "@docusaurus/Link";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { Axis, Dataset, EChartsx, Grid, Legend, LineSeries, Once, Title, Tooltip } from "@djagger/echartsx";

const languageColors = ['#faa275', '#ff8c61', '#ce6a85', '#985277', '#5c374c'];


export default forwardRef(function OverviewSection({}, ref: ForwardedRef<HTMLElement>) {
  return (
    <Section ref={ref}>
      <Overview/>
    </Section>
  );
});

const Overview = () => {
  const { login, userId } = useAnalyzeUserContext();
  const { inView } = useContext(InViewContext);

  return (
    <>
      <Banner login={login}/>
      <Stack direction={['column', 'column', 'row']} alignItems='center' sx={{ mt: 4 }} gap={4}>
        <Box flex={1}>
          <Typography variant="h2">Overview</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Know how we calculate contributions <Link>here</Link>!
          </Typography>
          <OverviewTable userId={userId} login={login} show={inView}/>
          <Languages login={login} userId={userId} show={inView}/>
        </Box>
        <Box flex={1} width='100%'>
          <ContributorTrends login={login} userId={userId} show={inView}/>
        </Box>
      </Stack>

    </>
  );

};

type ModuleProps = {
  login: string
  userId: number
  show: boolean
}

const Banner = ({ login }: { login: string }) => {
  return (
    <Stack direction="row" alignItems="center" justifyContent="flex-start" divider={<CustomDivider/>}>
      <Avatar src={`https://github.com/${login}.png`} sx={{ width: 72, height: 72 }}/>

      <Stack alignItems="flex-start" justifyContent="space-around">
        <Typography variant="h3" component="h1">{login}</Typography>
        <Stack direction="row" alignItems="center" justifyContent="flex-start" sx={{ mt: 1 }}>
          <MarkGithubIcon/>
          <Link href={`https://github.com/${login}`} target="_blank" style={{ marginLeft: 8 }}>
            {`https://github.com/${login}`}
          </Link>
        </Stack>
      </Stack>
    </Stack>
  );
};

const OverviewTable = ({ userId, show }: ModuleProps) => {
  const { data } = usePersonalOverview(userId, !!userId && show);

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
        <Pair data={data} name="star_repos">
          Starred Repos
        </Pair>
        <Pair data={data} name="star_earned">
          Starred Earned
        </Pair>
      </Tr>
      <Tr>
        <Pair data={data} name="contribute_repos">
          Contributed to
        </Pair>
        <Pair data={data} name="issues">
          Issues
        </Pair>
      </Tr>
      <Tr>
        <Pair data={data} name="pull_requests">
          Starred Repos
        </Pair>
        <Pair data={data} name="code_reviews">
          Starred Earned
        </Pair>
      </Tr>
      <Tr>
        <Pair data={data} dataColSpan={3} renderValue={(value, data) => (
          <>
            <Addition>+{data.code_additions}</Addition>
            &nbsp;
            /
            &nbsp;
            <Deletion>-{data.code_deletions}</Deletion>
          </>
        )}>
          Code Changes
        </Pair>
      </Tr>
      </tbody>
    </table>
  );
};

const Languages = ({ userId, show }: ModuleProps) => {
  const { data } = usePersonalData('personal-languages', userId, show);

  if (!data) {
    return <Skeleton/>;
  }

  return (
    <Box mt={4}>
      <Typography variant="h3">
        Most Used Languages
      </Typography>
      <Bar sx={{ mt: 2 }}>
        {data.data.map((lang, i) => (
          <Tick key={lang.language}
                sx={{ width: lang.percentage, backgroundColor: languageColors[i % languageColors.length] }}
          />
        ))}
      </Bar>
      <Stack sx={{ mt: 2 }} flexWrap="wrap" rowGap={2} columnGap={4} flexDirection="row">
        {data.data.map((lang, i) => (
          <DotText color={languageColors[i % languageColors.length]} label={lang.language} percent={lang.percentage}/>
        ))}
      </Stack>
    </Box>
  );
};

const ContributorTrends = ({ userId, show }: ModuleProps) => {
  const { data } = usePersonalData('personal-contribution-trends', userId, show)

  if (!data) {
    return <></>
  }

  return (
    <EChartsx init={{ height: 400, renderer: 'canvas' }} theme='dark'>
      <Once>
        <Title text='Contribution Trends' left='center'/>
        <Legend type='scroll' orient='horizontal' top={24} />
        <Grid left={0} right={0} bottom={0} containLabel />
        <Tooltip trigger='axis' axisPointer={{ type: 'line' }}/>
        <Axis.Time.X />
        <Axis.Value.Y />
        {contributionTypes.map(ct => (
          <LineSeries key={ct} name={ct} datasetId={ct} encode={{ x: 'event_month', y: 'cnt' }} symbolSize={0} />
        ))}
        {contributionTypes.map(ct => (
          <Dataset key={ct} id={ct} fromDatasetId='original' transform={{ type: 'filter', config: { value: ct, dimension: 'contribution_type' } }} />
        ))}
      </Once>
      <Dataset id='original' source={data?.data ?? []} />
    </EChartsx>
  )
}

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
  data: PersonalOverview | undefined
  name?: keyof PersonalOverview
  renderValue?: (value: any, data: PersonalOverview | undefined) => React.ReactNode
  children: ReactNode
  dataColSpan?: number
}

const Pair = ({ children, name, data, renderValue = value => value, dataColSpan }: PairProps) => {
  const value = data?.[name];
  return (
    <>
      <Td>{children}</Td>
      <Td colSpan={dataColSpan}>
        {!data ? <Skeleton width={24} sx={{ display: 'inline-block' }}/> : renderValue(value, data)}
      </Td>
    </>
  );
};

const Tr = styled('tr')({
  backgroundColor: 'transparent !important',
  border: 0,
})

const Td = styled('td')({
  border: 0,
})

const Addition = styled('span')({
  color: '#e5534b',
});

const Deletion = styled('span')({
  color: '#57ab5a',
});

const Bar = styled('ol')({
  display: 'flex',
  height: 6,
  borderRadius: 3,
  overflow: 'hidden',
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

const Tick = styled('li')({
  display: 'inline',
  height: 6,
});

const DotText = ({ color, label, percent }: { color: string, label: string, percent: number }) => {
  return (
    <Stack alignItems="center" flexDirection="row">
      <Box component="span" display="block" bgcolor={color} width={6} height={6} borderRadius={3} mr={1}/>
      <Typography component="span" variant="body2">{label}</Typography>
      &nbsp;
      <Typography component="span" variant="body2" color="#3c3c3c">({(percent * 100).toPrecision(2)}%)</Typography>
    </Stack>
  );
};
