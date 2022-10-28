import React, { ComponentType, SVGProps } from "react";
import Section, { SubSection } from "../_components/Section";
import { H2, H3, P2 } from "../_components/typograph";
import { styled } from "@mui/material/styles";
import _ActivitiesChart from "../_charts/activity.svg";
import Split from "../_components/Split";
import { BR, ResponsiveAligned, ResponsiveAlignedRight, ResponsiveColumnFlex, Spacer } from "../_components/styled";
import Insights, { InsightsProps } from "../_components/Insights";

export default function () {
  return (
    <Section>
      <SubSection>
        <H2>{title}</H2>
        <P2 maxWidth={1054} mt={3}>{description}</P2>
      </SubSection>
      <SubSection>
        <Split>
          <ResponsiveColumnFlex height={650}>
            <H3>{activityTitle}</H3>
            <P2 mt={3}>{activityDescription}</P2>
            <Spacer />
            <Insights>
              {activityInsights}
            </Insights>
          </ResponsiveColumnFlex>
          <ResponsiveAlignedRight>
            <ActivitiesChart width={undefined} height={undefined} />
          </ResponsiveAlignedRight>
        </Split>
      </SubSection>
      <SubSection>
        <H3>{detailsTitle}</H3>
        <P2 mt={3}>{detailsDescription}</P2>
        {detailedCharts.map(({ Chart, insights }, i) => (
          <Split key={i} mt={12} reversed={i % 2 === 0} spacing={4}>
            <ResponsiveColumnFlex justifyContent='center'>
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
const description = 'Each year, technology introduces new buzz words. Can we gain insight into technical trends through the open source repositories behind the hot words? We investigated five technical areas: Low Code, Web3, Actions, Database, and AI.';

const activityTitle = 'Activity levels of popular topics';
const activityDescription = 'We queried the number of open source repositories associated with each technical area, as well as the percentage of active repositories in 2022. Forking repositories are not included. “Active in 2022” means that collaborative events initiated by non-bots occurred in 2022. Collaborative events include CommitCommentEvent, IssueCommentEvent, IssuesEvent, PullRequestEvent, PullRequestReviewCommentEvent, PullRequestReviewEvent, PushEvent, and ReleaseEvent.';
const activityInsights = 'This figure shows that open source repositories in the Low Code topic are the most active, with 76.3% being active in 2022, followed by Web3 with 63.85%.';
const ActivitiesChart = styled(_ActivitiesChart)({
  maxWidth: 656,
});

const detailsTitle = 'Details in Popular topics';
const detailsDescription = (
  <>
    We looked at the annual increment of repositories, the annual increment of collaborative events, the number of
    developers participating in collaborative events, the annual increment of stars for each technology area over a
    4-year period. Then calculated the percentage growth for each year which can reflect new entrants, developer
    engagement in this technical field and the industry’s interest in this area.
    <BR />
    * The 2022 data comparison period is 2022.01.01 - 2022.09.30, compared to 2021.01.01 - 2021.09.30.
  </>
);

function makeChartSvg(svg: ComponentType<SVGProps<SVGSVGElement>>) {
  return styled(svg)({
    maxWidth: 686,
  });
}

const detailedCharts: {
  Chart: ComponentType<SVGProps<SVGSVGElement>>
  insights: InsightsProps['children']
}[] = [
  {
    Chart: makeChartSvg(require('../_charts/low-code.svg').default),
    insights: (
      <>
        Projects in the Low Code field are mostly open source, and it can be seen that 2021 is the peak period of
        project development, with a <strong>334.4%</strong> increase in new repositories and
        a <strong>191.84%</strong> increase in developer
        collaboration events.The industry’s attention increased most significantly in 2021, <strong>reaching
        227.47%</strong>.From
        January to September 2022, the year-on-year growth data shows that the number of new repositories is
        decreasing(<strong>-31.89%</strong>), but developer engagement and industry attention are still rising.
      </>
    ),
  },
  {
    Chart: makeChartSvg(require('../_charts/web3.svg').default),
    insights: (
      <>
        Most of the core technical of the Web3 field is currently not open source, and open source is mostly some
        peripheral projects, so open source projects can reflect the development of the Web3 ecology to a certain
        extent. Whether it is the participation of new repositories, developers, or the attention of the industry The
        Web3 ecosystem has maintained rapid growth in recent years, and the growth rate of new repositories peaked at
        <strong>360.22%</strong> in 2021.
      </>
    ),
  },
  {
    Chart: makeChartSvg(require('../_charts/actions.svg').default),
    insights: (
      <>
        The annual increase in repositories in Actions has been declining, but developer engagement and industry
        attention are still increasing slightly.
      </>
    ),
  },
  {
    Chart: makeChartSvg(require('../_charts/database.svg').default),
    insights: (
      <>
        Open source projects in the database field account for the majority. As an open source project in the direction
        of infrastructure, the threshold is high, compared with other fields, the growth rate in all aspects is
        relatively stable.
      </>
    ),
  },
  {
    Chart: makeChartSvg(require('../_charts/ai.svg').default),
    insights: (
      <>
        Open source projects in AI field have been gradually slowing down after 2 years of high growth in 2020-2021.
      </>
    ),
  },
];