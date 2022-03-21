import Section from "./common/section";
import React from "react";
import WorldMapChartCompareCard from "../../../components/RemoteCards/WorldMapChartCompareCard";

export default function () {
  return (
    <Section
      title='Countries/Regions of PR Creators'
      description='This map shows you where the PR creators come from and which countries or regions like the project the best.'
    >
      {({repo1, repo2, dateRange, allReposProvided}) => (
        <WorldMapChartCompareCard
          title="The country / area of PR creators"
          queryName={"pull-request-creators-map"}
          params1={{
            repoId: repo1?.id,
            dateRange: dateRange
          }}
          params2={{
            repoId: repo2?.id,
            dateRange: dateRange
          }}
          name1={repo1.name}
          name2={repo2.name}
          shouldLoad={allReposProvided([repo1, repo2])}
          noLoadReason="Need select repo."
          series={[{}]}
          dimensionColumnName="country_or_area"
          metricColumnName="count"
          height="400px"
        />
      )}
    </Section>
  )
}