import { createOpenAI } from "@ai-sdk/openai";
import { generateObject, streamObject } from "ai";
import { z } from "zod";

import { normalizeExplorerChart, inferExplorerFields } from "@/lib/explorer/chart";
import { explorerChartKinds, type ExplorerAnswer } from "@/lib/explorer/contracts";
import { buildExplorerPlanningPrompt } from "@/lib/explorer/prompt";
import { executeExplorerRows, explainExplorerRows } from "@/lib/explorer/query";
import { explorerRateLimit } from "@/lib/rate-limit";

export const runtime = "edge";
export const maxDuration = 30;

const requestSchema = z.object({
  question: z.string().trim().min(4).max(400),
  stream: z.boolean().optional(),
});

const chartSchema = z.object({
  kind: z.enum(explorerChartKinds),
  title: z.string().min(1).max(120),
  description: z.string().max(220),
  xKey: z.string().max(120).nullable(),
  yKeys: z.array(z.string().max(120)).max(3),
  labelKey: z.string().max(120).nullable(),
  valueKey: z.string().max(120).nullable(),
});

const planSchema = z.object({
  revisedQuestion: z.string().min(1).max(220),
  keywords: z.array(z.string().min(1).max(80)).max(6),
  subQuestions: z.array(z.string().min(1).max(180)).max(4),
  combinedQuestion: z.string().min(1).max(260),
  assumptions: z.array(z.string().max(160)).max(4),
  summary: z.string().min(1).max(260),
  sql: z.string().min(1).max(8000),
  chart: chartSchema,
});

const openaiApiKey =
  process.env.OPENAI_API_TOKEN || process.env.OPENAI_API_KEY || "";

const openai = createOpenAI({
  apiKey: openaiApiKey,
});

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const { success, remaining, reset } = await explorerRateLimit.limit(ip);
  if (!success) {
    const retryAfterSeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
    return Response.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
          "X-RateLimit-Remaining": String(remaining),
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const startedAt = Date.now();

  try {
    const body = requestSchema.parse(await request.json());

    if (!openaiApiKey) {
      return Response.json(
        { error: "Missing OPENAI_API_TOKEN (or OPENAI_API_KEY) for Data Explorer." },
        { status: 500, headers: { "Cache-Control": "no-store" } },
      );
    }

    if (body.stream) {
      return streamExplorerAnswer(body.question, startedAt);
    }

    const plan = await generateExplorerPlan(body.question);
    const answer = await buildExplorerAnswer(body.question, plan, startedAt);

    return Response.json(answer, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown explorer error";
    const status =
      error instanceof z.ZodError
        ? 400
        : /readonly|select statement|single sql statement|unsafe sql/i.test(message)
          ? 400
          : 500;

    return Response.json(
      { error: message },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
}

async function generateExplorerPlan(question: string) {
  const { object: plan } = await generateObject({
    model: openai("gpt-5.2"),
    schemaName: "ExplorerPlan",
    schemaDescription:
      "A safe readonly SQL plan and chart plan for OSSInsight Data Explorer.",
    schema: planSchema,
    prompt: buildExplorerPlanningPrompt(question),
    providerOptions: {
      openai: {
        reasoningEffort: "low",
        textVerbosity: "low",
      },
    },
  });

  return plan;
}

async function buildExplorerAnswer(
  question: string,
  plan: z.infer<typeof planSchema>,
  startedAt: number,
): Promise<ExplorerAnswer> {
  const sql = normalizeReadonlySql(plan.sql);
  assertReadonlySql(sql);

  const queryResult = await executeExplorerRows(sql);
  const rows = queryResult.rows as Record<string, unknown>[];
  const explainResult = await explainExplorerRows(sql);
  const explainPlan = explainResult.rows as Record<string, unknown>[];
  const engines = inferExplorerEngines(explainPlan);
  const fields =
    rows.length > 0
      ? inferExplorerFields(rows)
      : Object.keys(queryResult.types).map((name) => ({
          name,
          kind: "unknown" as const,
        }));
  const chart = normalizeExplorerChart(plan.chart, rows, fields);
  const summary = buildSummary(plan.summary, {
    revisedQuestion: plan.revisedQuestion,
    rowCount: rows.length,
    chart,
  });

  return {
    question,
    revisedQuestion: plan.revisedQuestion,
    assumptions: plan.assumptions,
    summary,
    sql,
    chart,
    fields,
    rows: rows.slice(0, 100),
    rowCount: rows.length,
    truncated: rows.length > 100,
    engines,
    plan: explainPlan,
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
  };
}

function streamExplorerAnswer(question: string, startedAt: number) {
  const encoder = new TextEncoder();

  return new Response(
    new ReadableStream({
      async start(controller) {
        const send = (payload: unknown) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        };

        try {
          send({ type: "phase", phase: "generating" });

          const result = streamObject({
            model: openai("gpt-5.2"),
            schemaName: "ExplorerPlan",
            schemaDescription:
              "A safe readonly SQL plan and chart plan for OSSInsight Data Explorer.",
            schema: planSchema,
            prompt: buildExplorerPlanningPrompt(question),
            providerOptions: {
              openai: {
                reasoningEffort: "low",
                textVerbosity: "low",
              },
            },
          });

          let lastPreview = "";
          let sqlPhaseSent = false;

          for await (const partial of result.partialObjectStream) {
            const preview = {
              question,
              revisedQuestion: partial.revisedQuestion ?? undefined,
              keywords: Array.isArray(partial.keywords)
                ? partial.keywords.filter((item): item is string => typeof item === "string")
                : undefined,
              subQuestions: Array.isArray(partial.subQuestions)
                ? partial.subQuestions.filter((item): item is string => typeof item === "string")
                : undefined,
              combinedQuestion: partial.combinedQuestion ?? undefined,
              assumptions: Array.isArray(partial.assumptions)
                ? partial.assumptions.filter((item): item is string => typeof item === "string")
                : undefined,
              summary: partial.summary ?? undefined,
              sql: partial.sql ?? undefined,
            };

            const serialized = JSON.stringify(preview);
            if (serialized !== lastPreview) {
              send({ type: "preview", preview });
              lastPreview = serialized;
            }

            if (!sqlPhaseSent && typeof partial.sql === "string" && partial.sql.trim()) {
              sqlPhaseSent = true;
              send({ type: "phase", phase: "sql" });
            }
          }

          const plan = await result.object;
          send({
            type: "preview",
            preview: {
              question,
              revisedQuestion: plan.revisedQuestion,
              keywords: plan.keywords,
              subQuestions: plan.subQuestions,
              combinedQuestion: plan.combinedQuestion,
              assumptions: plan.assumptions,
              summary: plan.summary,
              sql: plan.sql,
            },
          });
          send({ type: "phase", phase: "executing" });

          const answer = await buildExplorerAnswer(question, plan, startedAt);

          send({ type: "result", answer });
          send({ type: "done" });
          controller.close();
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown explorer error";
          send({ type: "error", error: message });
          controller.close();
        }
      },
    }),
    {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/event-stream; charset=utf-8",
        Connection: "keep-alive",
      },
    },
  );
}

function buildSummary(
  rawSummary: string,
  input: {
  revisedQuestion: string;
  rowCount: number;
  chart: ExplorerAnswer["chart"];
}) {
  if (input.rowCount === 0) {
    return "No rows matched the current question. Try narrowing the repository, time range, or metric.";
  }

  const cleaned = rawSummary.trim();
  if (cleaned) {
    return `${cleaned} Returned ${input.rowCount} row${input.rowCount === 1 ? "" : "s"}.`;
  }

  const label =
    input.chart.kind === "metric"
      ? "single metric"
      : input.chart.kind === "table"
        ? "table result"
        : `${input.chart.kind} chart`;

  return `${input.revisedQuestion} returned ${input.rowCount} rows and is shown as a ${label}.`;
}

function inferExplorerEngines(plan: Record<string, unknown>[]) {
  const engines = new Set<string>();

  for (const row of plan) {
    const text = Object.values(row)
      .filter((value): value is string => typeof value === "string")
      .join(" ")
      .toLowerCase();

    if (text.includes("tiflash")) {
      engines.add("tiflash");
    }
    if (text.includes("tikv")) {
      engines.add("tikv");
    }
    if (text.includes("cop[tidb]") || text.includes("mpp[tidb]") || text.includes(" task: root")) {
      engines.add("tidb");
    }
  }

  return Array.from(engines);
}

function normalizeReadonlySql(value: string) {
  const trimmed = value
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .trim()
    .replace(/;+$/, "");
  if (!/\blimit\b/i.test(trimmed)) {
    return `${trimmed}\nLIMIT 50`;
  }

  return trimmed;
}

function assertReadonlySql(sql: string) {
  if (!/^\s*(with\b[\s\S]+select\b|select\b)/i.test(sql)) {
    throw new Error("Data Explorer only accepts a single SELECT statement.");
  }

  const stripped = sql.replace(/;+\s*$/, "");
  if (stripped.includes(";")) {
    throw new Error("Data Explorer only accepts a single SQL statement.");
  }

  if (
    /\b(insert|update|delete|drop|alter|truncate|create|rename|grant|revoke|show|set|use|explain|describe|handler|load|lock|unlock|call|benchmark|sleep|outfile|dumpfile)\b/i.test(
      stripped,
    )
  ) {
    throw new Error("Data Explorer rejected unsafe SQL.");
  }
}
