import React, { ComponentType, SVGProps } from 'react';
import Section, { SubSection } from '../_components/Section';
import { H2, H3, P2 } from '../_components/typograph';
import { BarChart, LineChart } from '../_components/charts';
import Split from '../_components/Split';
import { BR, ResponsiveAligned, ResponsiveAlignedRight, ResponsiveColumnFlex, Spacer } from '../_components/styled';
import Insights, { InsightsProps } from '../_components/Insights';
import useIsLarge from '../_components/hooks/useIsLarge';

export default function () {
  const large = useIsLarge();

  return (
    <Section>
      <SubSection>
        <H2>{title}</H2>
        <P2 maxWidth={1054}>{description}</P2>
      </SubSection>
      <SubSection>
        <Split>
          <ResponsiveColumnFlex height={350}>
            <H3>{activityTitle}</H3>
            <P2>{activityDescription}</P2>
            <Spacer />
            <Insights>
              {activityInsights}
            </Insights>
          </ResponsiveColumnFlex>
          <ResponsiveAlignedRight>
            <ActivitiesChart />
          </ResponsiveAlignedRight>
        </Split>
      </SubSection>
      <SubSection
        title={detailsTitle}
        description={detailsDescription}
      >
        {detailedCharts.map(({ Chart, insights }, i) => (
          <Split key={i} mt={[2, 4, 6]} reversed={large && i % 2 === 0} spacing={4}>
            <ResponsiveColumnFlex justifyContent="center">
              <Insights maxWidth={711}>{insights}</Insights>
            </ResponsiveColumnFlex>
            <ResponsiveAligned type={i % 2 === 0 ? 'left' : 'right'}>
              <Chart width={undefined} height={undefined} />
            </ResponsiveAligned>
          </Split>
        ))}
      </SubSection>
    </Section>
  );
}

const title = 'Popular open source topics';
const description = (
  <>
    Each year, technology introduces new buzz words. Can we gain insight into technical trends through the open source repositories behind the hot words? We investigated five technical areas: <strong>Low Code, Web3, GitHub Actions, Database, and AI</strong>.
  </>
);
const activityTitle = 'Activity levels of popular topics';
const activityDescription = 'We queried the number of open source repositories associated with each technical area, as well as the percentage of active repositories in 2022.';
const activityInsights = (
  <>
    This figure shows that open source repositories in the Low Code topic are the most active, with <strong>76.3%</strong> being active in 2022, followed by Web3 with <strong>63.85%</strong>.
  </>
);

const ActivitiesChart = () => {
  const large = useIsLarge();

  return (
    <BarChart
      aspect={large ? 16 / 9 : 4 / 3}
      data={require('../_charts/activity.json')}
      footnote="* Time range of 2022: 01.01-09.30, excluding bot events and forking repositories"
      sx={{
        maxWidth: 656,
      }}
    />
  );
};

const detailsTitle = 'Popular topics over the years';
const detailsDescription = (
  <>
    We queried the following items for each technical area from 2015 to 2022:
    <BR />
    - The annual increment of repositories
    <BR />
    - The annual increment of collaborative events
    <BR />
    - The number of developers participating in collaborative events
    <BR />
    - The annual increment of stars
    <BR />
    Then, we calculated the growth rate for each year which can reflect new entrants, developer engagement in this
    technical field, and the industry&apos;s interest in this area. For 2022, we compare its first nine months with the first
    nine months of 2021.
  </>
);

const detailedCharts: Array<{
  Chart: ComponentType<SVGProps<SVGSVGElement>>;
  insights: InsightsProps['children'];
}> = [
  {
    Chart: () => {
      return (
        <LineChart
          name="Low Code"
          data={require('../_charts/low-code.json')}
          sx={{ maxWidth: 686 }}
        />
      );
    },
    insights: (
      <>
        We can see that 2020 is the peak period of project development, with a <strong>313.43%</strong> increase in new
        repositories and a <strong>157.06%</strong> increase in developer collaborative events. The industry&apos;s interest
        increased most significantly in 2021, reaching <strong>184.82%</strong>. In 2022, the year-on-year growth data
        shows that the number of new repositories decreased <strong>(-26.21%)</strong>, but developer engagement and
        industry interest are still rising.
      </>
    ),
  },
  {
    Chart: () => {
      return (
        <LineChart
          name="Web3"
          data={require('../_charts/web3.json')}
          sx={{ maxWidth: 686 }}
        />
      );
    },
    insights: (
      <>
        Whether it is the creation of new repositories, developers, or the interest of the industry, the Web3 ecosystem
        has grown rapidly in recent years, and the growth rate of new repositories peaked at <strong>322.65%</strong> in
        2021.
      </>
    ),
  },
  {
    Chart: () => {
      return (
        <LineChart
          name="GitHub Actions"
          data={require('../_charts/actions.json')}
          sx={{ maxWidth: 686 }}
        />
      );
    },
    insights: (
      <>
        The annual increase of GitHub Actions repositories has been declining, but developer engagement and the
        industry&apos;s interest are still increasing slightly.
      </>
    ),
  },
  {
    Chart: () => {
      return (
        <LineChart
          name="Database"
          data={require('../_charts/database.json')}
          sx={{ maxWidth: 686 }}
        />
      );
    },
    insights: (
      <>
        As an infrastructure project, the Database project&apos;s threshold is high. Compared with projects in other fields,
        a database project has a stable growth rate.
      </>
    ),
  },
  {
    Chart: () => {
      return (
        <LineChart
          name="AI"
          data={require('../_charts/ai.json')}
          sx={{ maxWidth: 686 }}
        />
      );
    },
    insights: (
      <>
        After two years of high growth in 2016 and 2017, open source projects in AI have been growing gradually slowly.
      </>
    ),
  },
];
