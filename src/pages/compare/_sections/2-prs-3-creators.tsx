import Section from "./common/section";
import LineAreaBarChartCard from "../../../components/RemoteCards/LineAreaBarChartCard";
import {getRandomColor} from "../../../lib/color";
import React from "react";

export default function () {
  return (
    <Section
      title='PR Creators per Month'
      description='This chart displays the number of PR creators the two projects had respectively each week since 2011.'
    >
      {({ repo1, repo2, dateRange, allProvidedRepos, allReposProvided}) => (
        <LineAreaBarChartCard
          title={'Pull Request Creator per month'}
          queryName={"pull-request-creators-per-month"}
          params={{
            repoId1: repo1?.id,
            repoId2: repo2?.id,
            dateRange: dateRange
          }}
          shouldLoad={allReposProvided([repo1, repo2])}
          noLoadReason="Need select repo."
          seriesColumnName="repo_name"
          series={allProvidedRepos([repo1, repo2]).map((r) => {
            return {
              name: r.name,
              color: r.color || getRandomColor(),
              axisLabel: {
                formatter: '{yyyy} {MMM}'
              }
            };
          })}
          xAxis={{
            type: "time",
            name: "event_month"
          }}
          yAxis={{
            type: "value",
            name: "month_pr_count"
          }}
          height="500px"
        />
      )}
    </Section>
  )
}