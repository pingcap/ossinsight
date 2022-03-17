import Section from "./common/section";
import React from "react";
import WorldMapChartCompareCard from "../../../components/RemoteCards/WorldMapChartCompareCard";

export default function () {
  return (
    <Section title='title' description='desc'>
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