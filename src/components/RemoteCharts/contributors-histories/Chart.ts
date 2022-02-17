import {withBarChartQuery} from "../withQuery";

export const ContributorsHistoryRemoteChart = withBarChartQuery("contributors-history", {
  categoryIndex: 'repo_name',
  valueIndex: "contributors_count"
})
