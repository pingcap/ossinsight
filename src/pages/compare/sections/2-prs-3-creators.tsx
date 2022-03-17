import Section from "./common/section";
import LineAreaBarChartCard from "../../../components/RemoteCards/LineAreaBarChartCard";
import {getRandomColor} from "../../../lib/color";
import React from "react";

export default function () {
  return (
    <Section title='title' description='desc'>
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
            name: "total"
          }}
          height="500px"
        />
      )}
    </Section>
  )
}