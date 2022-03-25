import Section from "./common/section";
import React from "react";
import WorldMapChartCompareCard from "../../../components/RemoteCards/WorldMapChartCompareCard";

export default function () {
  return (
    <Section
      title='Countries/Regions of Issue Openers'
      description='This map will show you which country or region does issue creators come from. They make an issue to report the problem, or request a new feature.'
      advanced
    >
      {({repo1, repo2, dateRange, allReposProvided}) => (
        <WorldMapChartCompareCard
          title="The country / area of issue openers"
          queryName={"issue-creators-map"}
          params1={{
            repoId: repo1?.id,
            dateRange: dateRange
          }}
          params2={{
            repoId: repo2?.id,
            dateRange: dateRange
          }}
          name1={repo1?.name}
          name2={repo2?.name}
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