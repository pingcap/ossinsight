import Section from "./common/section";
import WorldMapChartCompareCard from "../../../components/RemoteCards/WorldMapChartCompareCard";
import React from "react";

export default function () {
  return (
    <Section
      title="Stargazers' Geographical Distribution"
      description='This map displays which country or region the stargazers of each project come from.'
    >
      {({ repo1, repo2, dateRange, allReposProvided }) => (
        <WorldMapChartCompareCard
          title="Stargazers' Geographical Distribution"
          queryName={"stars-map"}
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
