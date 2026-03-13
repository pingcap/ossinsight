import type {
  ExplorerChartConfig,
  ExplorerChartKind,
  ExplorerField,
  ExplorerFieldKind,
} from "@/lib/explorer/contracts";
import { getExplorerChartPreset } from "@/lib/explorer/presets";

type RawChartPlan = Partial<ExplorerChartConfig>;

function isNumericValue(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }

  return Number.isFinite(Number(value));
}

function isBooleanValue(value: unknown) {
  return typeof value === "boolean";
}

function isTemporalValue(name: string, value: unknown) {
  if (value == null) {
    return false;
  }

  if (/(date|time|month|year|week|day)/i.test(name)) {
    return true;
  }

  if (typeof value === "string") {
    return /^\d{4}(-\d{2}(-\d{2})?)?/.test(value) || value.includes("T");
  }

  return false;
}

export function inferExplorerFields(rows: Record<string, unknown>[]) {
  const fieldNames = rows[0] ? Object.keys(rows[0]) : [];

  return fieldNames.map((name) => ({
    name,
    kind: inferFieldKind(name, rows),
  })) satisfies ExplorerField[];
}

function inferFieldKind(
  name: string,
  rows: Record<string, unknown>[],
): ExplorerFieldKind {
  const sampleValues = rows
    .map((row) => row[name])
    .filter((value) => value != null)
    .slice(0, 12);

  if (sampleValues.length === 0) {
    return "unknown";
  }

  if (sampleValues.every(isBooleanValue)) {
    return "boolean";
  }

  if (sampleValues.every((value) => isTemporalValue(name, value))) {
    return "time";
  }

  if (sampleValues.every(isNumericValue)) {
    return "number";
  }

  return "text";
}

export function normalizeExplorerChart(
  plan: RawChartPlan,
  rows: Record<string, unknown>[],
  fields: ExplorerField[],
): ExplorerChartConfig {
  const names = new Set(fields.map((field) => field.name));
  const numericFields = fields.filter((field) => field.kind === "number");
  const timeFields = fields.filter((field) => field.kind === "time");
  const textFields = fields.filter((field) => field.kind === "text");

  const hasRows = rows.length > 0;
  const pick = (value: string | null | undefined) =>
    value && names.has(value) ? value : null;
  const pickMany = (values: string[] | undefined) =>
    (values ?? []).filter((value) => names.has(value)).slice(0, 3);

  let kind = normalizeKind(plan.kind);
  let xKey = pick(plan.xKey);
  let yKeys = pickMany(plan.yKeys);
  let labelKey = pick(plan.labelKey);
  let valueKey = pick(plan.valueKey);

  if (!hasRows) {
    kind = "table";
  }

  if (kind === "metric" && rows.length !== 1) {
    kind = "table";
  }

  if (kind === "metric") {
    valueKey = valueKey ?? numericFields[0]?.name ?? null;
    labelKey = labelKey ?? textFields[0]?.name ?? null;
  }

  if (kind === "pie") {
    labelKey = labelKey ?? textFields[0]?.name ?? xKey ?? null;
    valueKey = valueKey ?? numericFields[0]?.name ?? yKeys[0] ?? null;
    if (!labelKey || !valueKey) {
      kind = fallbackKind(rows, fields);
    }
  }

  if (kind === "bar" || kind === "line" || kind === "area") {
    xKey = xKey ?? timeFields[0]?.name ?? textFields[0]?.name ?? null;
    yKeys = yKeys.length > 0 ? yKeys : numericFields.slice(0, 2).map((field) => field.name);
    if (!xKey || yKeys.length === 0) {
      kind = fallbackKind(rows, fields);
    }
  }

  if (kind === "table") {
    xKey = null;
    yKeys = [];
    labelKey = null;
    valueKey = null;
  }

  if (kind === "metric" && !valueKey) {
    kind = "table";
  }

  if (kind === "pie" && (!labelKey || !valueKey)) {
    kind = "table";
  }

  if ((kind === "bar" || kind === "line" || kind === "area") && (!xKey || yKeys.length === 0)) {
    kind = "table";
  }

  if (kind === "table" && rows.length === 1 && numericFields.length > 0) {
    kind = "metric";
    valueKey = numericFields[0]?.name ?? null;
    labelKey = textFields[0]?.name ?? null;
  }

  return {
    kind,
    preset: getExplorerChartPreset(kind),
    title: plan.title?.trim() || defaultTitle(kind),
    description: plan.description?.trim() || defaultDescription(kind),
    xKey,
    yKeys,
    labelKey,
    valueKey,
  };
}

function normalizeKind(value: RawChartPlan["kind"]): ExplorerChartKind {
  if (
    value === "bar" ||
    value === "line" ||
    value === "area" ||
    value === "pie" ||
    value === "metric" ||
    value === "table"
  ) {
    return value;
  }

  return "table";
}

function fallbackKind(rows: Record<string, unknown>[], fields: ExplorerField[]): ExplorerChartKind {
  const numericFields = fields.filter((field) => field.kind === "number");
  const timeFields = fields.filter((field) => field.kind === "time");
  const textFields = fields.filter((field) => field.kind === "text");

  if (rows.length === 1 && numericFields.length > 0) {
    return "metric";
  }

  if (timeFields.length > 0 && numericFields.length > 0) {
    return "line";
  }

  if (textFields.length > 0 && numericFields.length > 0) {
    return "bar";
  }

  return "table";
}

function defaultTitle(kind: ExplorerChartKind) {
  switch (kind) {
    case "metric":
      return "Key Metric";
    case "pie":
      return "Distribution";
    case "line":
    case "area":
      return "Trend";
    case "bar":
      return "Ranking";
    default:
      return "Query Result";
  }
}

function defaultDescription(kind: ExplorerChartKind) {
  switch (kind) {
    case "metric":
      return "A compact metric card for the single-row result.";
    case "pie":
      return "A distribution view of the returned categories.";
    case "line":
    case "area":
      return "A trend chart for time or ordered categories.";
    case "bar":
      return "A ranked comparison across categories.";
    default:
      return "The raw query result in table form.";
  }
}
