import Section from "./common/section";
import PieChartCompareCard from "../../../components/RemoteCards/PieChartCompareCard";
import React from "react";

export default function () {
  return (
    <Section
      title="Stargazers' Employment Distribution"
      description='The pie charts describe which company stargazers of each project come from.'
    >
      {({repo1, repo2, dateRange, allReposProvided}) => (
        <PieChartCompareCard
          title="Stargazers' Employment Distribution"
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
