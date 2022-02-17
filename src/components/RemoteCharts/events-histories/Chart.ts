import {withBarChartQuery} from "../withQuery";

export const EventsHistoryRemoteChart = withBarChartQuery("events-history", {
  categoryIndex: 'repo_name',
  valueIndex: "events_count"
})
