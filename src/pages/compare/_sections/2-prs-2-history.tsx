import Section from "./common/section";
import {getRandomColor} from "../../../lib/color";
import LineAreaBarChartCard from "../../../components/RemoteCards/LineAreaBarChartCard";
import React from "react";

export default function () {
  return (
    <Section
      title='PR History'
      description='This chart displays the accumulated number of PRs the two projects gained respectively each year.'
    >
      {({ repo1, repo2, dateRange, allReposProvided, allProvidedRepos }) => (
        <LineAreaBarChartCard
          title={'PR History'}
          queryName={"pull-requests-history"}
          params={{
            repoId1: repo1?.id,
            repoId2: repo2?.id,
            dateRange: dateRange
          }}
          shouldLoad={allReposProvided([repo1, repo2])}
          noLoadReason="Need select repo."
          seriesColumnName="repo_name"
          series={[repo1, repo2].map((r) => {
            return {
              name: r?.name,
              color: r?.color || getRandomColor(),
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
            name: "total"
          }}
          height="500px"
        />
      )}
    </Section>
  )
}