/**
 * Regression suite for the `ai-tool` edge function.
 *
 * Guards against two production incidents we've shipped fixes for:
 *
 *   1. HTTP 402 "Insufficient points / Unauthorized" caused by the points
 *      deduction RPC requiring `auth.uid()` under a service-role client.
 *      (Fixed by switching to `api_deduct_points` in ai-tool/index.ts.)
 *
 *   2. Empty streamed output — the SSE stream completes with no `delta.content`
 *      chunks, leaving the user staring at a blank tool card.
 *
 * This suite is intentionally NOT part of the default `bun run test` run because
 * it performs real network calls to the deployed edge function and consumes AI
 * credits. CI runs it as a separate job via `bun run test:backend-regression`.
 *
 * Required env:
 *   - VITE_SUPABASE_URL                 (already in .env)
 *   - VITE_SUPABASE_PUBLISHABLE_KEY     (already in .env)
 *   - TEST_USER_EMAIL                   (a real signed-up user with >= 50 points)
 *   - TEST_USER_PASSWORD
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { appendFileSync } from "node:fs";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;
const GITHUB_STEP_SUMMARY = process.env.GITHUB_STEP_SUMMARY;
const IS_CI = !!process.env.GITHUB_ACTIONS;

type Failure = {
  toolId: string;
  status: number;
  statusText: string;
  reason: string;
  bodySnippet: string;
};
const failures: Failure[] = [];

function reportFailure(f: Failure) {
  failures.push(f);
  if (IS_CI) {
    // GitHub Actions annotation — surfaces inline at the top of the run.
    const msg = `Tool "${f.toolId}" failed: HTTP ${f.status} ${f.statusText} — ${f.reason}`;
    // eslint-disable-next-line no-console
    console.log(`::error title=Backend regression: ${f.toolId}::${msg}`);
  }
}

// Keep in sync with `toolPrompts` in supabase/functions/ai-tool/index.ts
const TOOL_IDS = [
  "ai-prompt-generator",
  "ai-blog-title",
  "ai-image-prompt",
  "ai-tweet-generator",
  "ai-hashtag-generator",
  "ai-bio-generator",
  "ai-product-desc",
  "ai-email-generator",
  "ai-code-generator",
  "ai-chat",
  "keyword-suggestions",
  "seo-title-generator",
  "competitor-keywords",
  "seo-audit",
  "backlink-checker",
  "domain-authority",
  "competitor-ranking",
  "smtp-tester",
  "code-converter",
  "ai-code-reviewer",
  "ai-regex-generator",
  "ai-sql-generator",
  "ai-code-explainer",
  "ai-dax-generator",
  "ai-power-query-generator",
] as const;

const SAMPLE_INPUT =
  "Regression test ping — respond with a short one-sentence acknowledgement.";

let accessToken = "";

async function readStreamedContent(res: Response): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload);
        const delta = json?.choices?.[0]?.delta?.content;
        if (typeof delta === "string") content += delta;
      } catch {
        // ignore non-JSON keepalive lines
      }
    }
  }
  return content;
}

async function callTool(toolId: string) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-tool`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ toolId, input: SAMPLE_INPUT }),
  });
  return res;
}

describe("ai-tool backend regression (no 402, no empty output)", () => {
  beforeAll(async () => {
    if (!TEST_USER_EMAIL || !TEST_USER_PASSWORD) {
      throw new Error(
        "TEST_USER_EMAIL and TEST_USER_PASSWORD must be set. " +
          "These should belong to a real test account in the project " +
          "with enough points to run all tools at least once.",
      );
    }
    const sb = createClient(SUPABASE_URL, ANON_KEY);
    const { data, error } = await sb.auth.signInWithPassword({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    });
    if (error || !data.session?.access_token) {
      throw new Error(`Failed to sign in test user: ${error?.message}`);
    }
    accessToken = data.session.access_token;
  });

  afterAll(() => {
    if (!failures.length) return;
    const first = failures[0];
    const header = `❌ Backend regression: ${failures.length} tool(s) failed. First failure: "${first.toolId}" → HTTP ${first.status} ${first.statusText} (${first.reason})`;
    // eslint-disable-next-line no-console
    console.log(header);
    if (GITHUB_STEP_SUMMARY) {
      const lines = [
        `### ❌ Backend regression failures (${failures.length})`,
        "",
        `**First failing tool:** \`${first.toolId}\` — HTTP \`${first.status} ${first.statusText}\` — ${first.reason}`,
        "",
        "| Tool | Status | Reason |",
        "| --- | --- | --- |",
        ...failures.map(
          (f) => `| \`${f.toolId}\` | ${f.status} ${f.statusText} | ${f.reason} |`,
        ),
        "",
      ].join("\n");
      try {
        appendFileSync(GITHUB_STEP_SUMMARY, lines + "\n");
      } catch {
        /* ignore */
      }
    }
  });

  TOOL_IDS.forEach((toolId) => {
    it(
      `tool "${toolId}" returns a non-empty response and never 402`,
      async () => {
        const res = await callTool(toolId);
        const bodyText = res.ok ? "" : await res.clone().text();
        const snippet = bodyText.slice(0, 300);

        if (res.status === 402) {
          reportFailure({
            toolId,
            status: res.status,
            statusText: res.statusText,
            reason: "402 Unauthorized (points/auth regression)",
            bodySnippet: snippet,
          });
        } else if (!res.ok) {
          reportFailure({
            toolId,
            status: res.status,
            statusText: res.statusText,
            reason: `non-2xx response: ${snippet}`,
            bodySnippet: snippet,
          });
        }

        expect(
          res.status,
          `${toolId} returned 402 — points/auth regression (body: ${snippet})`,
        ).not.toBe(402);

        expect(
          res.ok,
          `${toolId} returned HTTP ${res.status} ${res.statusText} (body: ${snippet})`,
        ).toBe(true);

        const content = await readStreamedContent(res);
        if (content.trim().length === 0) {
          reportFailure({
            toolId,
            status: res.status,
            statusText: res.statusText,
            reason: "empty streamed body",
            bodySnippet: "",
          });
        }
        expect(
          content.trim().length,
          `${toolId} streamed an empty body`,
        ).toBeGreaterThan(0);
      },
      90_000,
    );
  });
});
