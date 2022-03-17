import Section from "./common/section";
import PieChartCompareCard from "../../../components/RemoteCards/PieChartCompareCard";
import React from "react";

export default function () {
  return (
    <Section title='title' description='desc'>
      {({repo1, repo2, dateRange, allReposProvided}) => (
        <PieChartCompareCard
          title="Top 50 company of stargazers"
          queryName={"stars-top-50-company"}
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
          series={[
            {
              name: "company"
            }
          ]}
          dimensionColumnName="company_name"
          metricColumnName="stargazers"
          height="400px"
        />
      )}
    </Section>
  )
}