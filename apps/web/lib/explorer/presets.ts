import type { ExplorerChartKind, ExplorerChartPreset } from "@/lib/explorer/contracts";

export function getExplorerChartPreset(kind: ExplorerChartKind): ExplorerChartPreset {
  switch (kind) {
    case "metric":
      return "metric-signal";
    case "pie":
      return "share-donut";
    case "line":
      return "timeseries-line";
    case "area":
      return "timeseries-area";
    case "bar":
      return "ranking-bars";
    default:
      return "result-table";
  }
}

export const explorerPresetLabels: Record<ExplorerChartPreset, string> = {
  "metric-signal": "Metric Signal",
  "ranking-bars": "Ranking Bars",
  "timeseries-line": "Time Series",
  "timeseries-area": "Filled Trend",
  "share-donut": "Share Donut",
  "result-table": "Result Table",
};
