// Run: node --experimental-vm-modules --test tests/explorer-provider.test.mjs
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import * as sdk from "@ai-sdk/openai";
import * as ai from "ai";
import * as zod from "zod";

const plan = {
  revisedQuestion: "Count repositories",
  keywords: [],
  subQuestions: [],
  combinedQuestion: "Count repositories",
  assumptions: [],
  summary: "Repository count",
  sql: "SELECT 1 AS count",
  chart: {
    kind: "table", title: "Repositories", description: "",
    xKey: null, yKeys: [], labelKey: null, valueKey: null,
  },
};

async function loadRoute(env) {
  const context = vm.createContext({
    process: { env }, Response, ReadableStream, TextEncoder, Date, Set,
  });
  const synthetic = (exports) => new vm.SyntheticModule(
    Object.keys(exports),
    function () {
      for (const [key, value] of Object.entries(exports)) this.setExport(key, value);
    },
    { context },
  );
  const modules = {
    "@ai-sdk/openai": synthetic(sdk),
    ai: synthetic(ai),
    zod: synthetic(zod),
    "@/lib/explorer/contracts": synthetic({ explorerChartKinds: ["table"] }),
    "@/lib/explorer/chart": synthetic({
      normalizeExplorerChart: (chart) => chart,
      inferExplorerFields: () => [],
    }),
    "@/lib/explorer/prompt": synthetic({
      buildExplorerPlanningPrompt: (question) => question,
    }),
    "@/lib/explorer/query": synthetic({
      executeExplorerRows: async () => ({ rows: [{ count: 1 }], types: {} }),
      explainExplorerRows: async () => ({ rows: [] }),
    }),
  };
  async function source(path, suffix = "") {
    const text = await readFile(new URL(path, import.meta.url), "utf8");
    return new vm.SourceTextModule(ts.transpileModule(text + suffix, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText, { context });
  }
  const provider = await source("../lib/explorer/provider.ts");
  modules["@/lib/explorer/provider"] = provider;
  // Expose private inference entry points only in this in-memory test module.
  // POST must continue returning its existing maintenance response in production.
  const route = await source("../app/api/explorer/ask/route.ts",
    "\nexport { generateExplorerPlan, streamExplorerAnswer, resolveExplorerModel, explorerProviderOptions };\n");
  await route.link((specifier) => {
    assert.ok(modules[specifier], `Unexpected import: ${specifier}`);
    return modules[specifier];
  });
  await route.evaluate();
  return { route: route.namespace, provider: provider.namespace };
}

function completion(body) {
  if (!body.stream) {
    return Response.json({
      id: "fixture", object: "chat.completion", created: 0, model: body.model,
      choices: [{ index: 0, message: { role: "assistant", content: JSON.stringify(plan) }, finish_reason: "stop" }],
      usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
    });
  }
  const chunk = (delta, finish_reason = null) => ({
    id: "fixture", object: "chat.completion.chunk", created: 0, model: body.model,
    choices: [{ index: 0, delta, finish_reason }],
  });
  const data = [
    chunk({ role: "assistant", content: JSON.stringify(plan) }),
    chunk({}, "stop"),
  ].map((value) => `data: ${JSON.stringify(value)}\n\n`).join("");
  return new Response(`${data}data: [DONE]\n\n`, {
    headers: { "Content-Type": "text/event-stream" },
  });
}

const cases = [
  { name: "global default", env: {}, model: "MiniMax-M3.1-Flash", base: "https://api.minimax.io/v1" },
  { name: "China default", env: { MINIMAX_API_REGION: "cn_zh" }, model: "MiniMax-M3.1-Flash", base: "https://api.minimax.cn/v1" },
  { name: "explicit M3", env: { MINIMAX_MODEL: "MiniMax-M3" }, model: "MiniMax-M3", base: "https://api.minimax.io/v1" },
  { name: "explicit legacy", env: { MINIMAX_MODEL: "MiniMax-M2.7" }, model: "MiniMax-M2.7", base: "https://api.minimax.io/v1" },
  { name: "custom deployment", env: { MINIMAX_MODEL: " deployment-model ", MINIMAX_API_BASE_URL: " https://gateway.example.test/v1/// " }, model: "deployment-model", base: "https://gateway.example.test/v1" },
  { name: "explicit legacy endpoint", env: { MINIMAX_API_REGION: "cn_zh", MINIMAX_API_BASE_URL: "https://api.minimaxi.com/v1" }, model: "MiniMax-M3.1-Flash", base: "https://api.minimaxi.com/v1" },
  { name: "blank setting", env: { MINIMAX_MODEL: "  " }, model: "MiniMax-M3.1-Flash", base: "https://api.minimax.io/v1" },
];

for (const scenario of cases) {
  for (const stream of [false, true]) {
    test(`${scenario.name}: ${stream ? "streaming" : "nonstreaming"} route serializes the selected model`, async (t) => {
      const requests = [];
      t.mock.method(globalThis, "fetch", async (url, init) => {
        const body = JSON.parse(init.body);
        requests.push({ url: String(url), body });
        return completion(body);
      });
      const { route } = await loadRoute({ MINIMAX_API_KEY: "fixture-key", ...scenario.env });
      if (stream) {
        const response = route.streamExplorerAnswer("Count repositories", Date.now());
        const text = await response.text();
        assert.ok(text.includes('"type":"result"'), text);
        assert.ok(text.includes('"type":"done"'), text);
        assert.ok(!text.includes('"type":"error"'), text);
      } else {
        assert.deepEqual(await route.generateExplorerPlan("Count repositories"), plan);
      }
      assert.equal(requests.length, 1);
      const { url, body } = requests[0];
      assert.equal(url, `${scenario.base}/chat/completions`);
      assert.equal(body.model, scenario.model);
      assert.equal(body.stream, stream ? true : undefined);
      assert.equal(body.messages.at(-1).content, "Count repositories");
      assert.equal(body.response_format.type, "json_schema");
      for (const key of ["thinking", "reasoning_effort", "reasoning_split", "service_tier", "verbosity"]) {
        assert.equal(body[key], undefined, `${key} must not override MiniMax defaults`);
      }
    });
  }
}

test("catalog is Flash first with M3, and explicit configuration remains usable", async () => {
  const { provider } = await loadRoute({});
  assert.deepEqual(Object.keys(provider.MINIMAX_MODELS), ["MiniMax-M3.1-Flash", "MiniMax-M3"]);
  assert.equal(provider.MINIMAX_DEFAULT_MODEL, "MiniMax-M3.1-Flash");
  assert.equal(provider.MINIMAX_MODELS["MiniMax-M3.1-Flash"].contextWindow, 1_000_000);
  assert.equal(provider.readMinimaxConfig({ MINIMAX_API_KEY: " " }), null);
  assert.equal(provider.resolveMinimaxModel("legacy-model"), "legacy-model");
});

test("existing fallback request is retained when MiniMax is unconfigured", async (t) => {
  const requests = [];
  t.mock.method(globalThis, "fetch", async (url, init) => {
    requests.push({ url: String(url), body: JSON.parse(init.body) });
    return Response.json({
      id: "resp_fixture", object: "response", created_at: 0, status: "completed",
      model: "gpt-5.2",
      output: [{
        id: "msg_fixture", type: "message", role: "assistant", status: "completed",
        content: [{ type: "output_text", text: JSON.stringify(plan), annotations: [] }],
      }],
      usage: { input_tokens: 10, output_tokens: 20, total_tokens: 30 },
    });
  });
  const { route } = await loadRoute({ OPENAI_API_KEY: "fixture-key" });
  assert.deepEqual(await route.generateExplorerPlan("Count repositories"), plan);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "https://api.openai.com/v1/responses");
  assert.equal(requests[0].body.model, "gpt-5.2");
  assert.equal(requests[0].body.reasoning.effort, "low");
  assert.equal(requests[0].body.text.verbosity, "low");
});

test("POST remains under maintenance and does not send an inference request", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", () => {
    throw new Error("Maintenance must not call inference");
  });
  const { route } = await loadRoute({ MINIMAX_API_KEY: "fixture-key" });
  const response = await route.POST(new Request("https://example.test/api/explorer/ask", {
    method: "POST", body: JSON.stringify({ question: "Count repositories" }),
  }));
  assert.equal(response.status, 503);
  assert.equal((await response.json()).code, "EXPLORER_UNDER_MAINTENANCE");
  assert.equal(fetch.mock.callCount(), 0);
});
