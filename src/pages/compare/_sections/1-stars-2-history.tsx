import {getRandomColor} from "../../../lib/color";
import LineAreaBarChartCard from "../../../components/RemoteCards/LineAreaBarChartCard";
import React from "react";
import Section from "./common/section";

export default function () {
  return (
    <Section
      title='Star History'
      description='This chart displays the accumulated number of stars the two projects gained respectively each year since 2011.'
    >
      {({repo1, repo2, dateRange, allReposProvided, allProvidedRepos}) => (
        <LineAreaBarChartCard
          title={'Stars History'}
          queryName={"stars-history"}
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
            name: "total"
          }}
          height="500px"
        />
      )}
    </Section>
  )
}