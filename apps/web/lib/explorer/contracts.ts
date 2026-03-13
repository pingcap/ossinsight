export const explorerChartKinds = [
  "bar",
  "line",
  "area",
  "pie",
  "metric",
  "table",
] as const;

export const explorerChartPresets = [
  "metric-signal",
  "ranking-bars",
  "timeseries-line",
  "timeseries-area",
  "share-donut",
  "result-table",
] as const;

export type ExplorerChartKind = (typeof explorerChartKinds)[number];
export type ExplorerChartPreset = (typeof explorerChartPresets)[number];

export type ExplorerFieldKind = "number" | "text" | "time" | "boolean" | "unknown";

export interface ExplorerChartConfig {
  kind: ExplorerChartKind;
  preset: ExplorerChartPreset;
  title: string;
  description: string;
  xKey: string | null;
  yKeys: string[];
  labelKey: string | null;
  valueKey: string | null;
}

export interface ExplorerField {
  name: string;
  kind: ExplorerFieldKind;
}

export interface ExplorerAnswer {
  question: string;
  revisedQuestion: string;
  assumptions: string[];
  summary: string;
  sql: string;
  chart: ExplorerChartConfig;
  fields: ExplorerField[];
  rows: Record<string, unknown>[];
  rowCount: number;
  truncated: boolean;
  engines: string[];
  plan: Record<string, unknown>[];
  generatedAt: string;
  durationMs: number;
}
