/**
 * Regression suite for the `ai-tool` edge function.
 *
 * Guards against two production incidents we've seen:
 *   1. The function returning HTTP 402 "Unauthorized" (caused by the
 *      points-deduction RPC requiring `auth.uid()` under a service-role client).
 *   2. The function returning an empty body (stream completes with no content).
 *
 * The test calls the deployed edge function once per supported tool ID using
 * the anon key (guest mode) and a unique `x-forwarded-for` IP so the in-memory
 * guest daily-limit (2/IP) is not tripped.
 *
 * CI will fail if ANY tool returns 402 or an empty/blank streamed output.
 */
import { describe, it, expect } from "vitest";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

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
  "Regression test ping: respond with a short one-sentence acknowledgement.";

/** Parse an SSE stream from the AI gateway and return concatenated text content. */
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

async function callTool(toolId: string, ipSeed: number) {
  // Unique X-Forwarded-For per call avoids the 2/day guest limit (per-IP).
  const ip = `10.${(ipSeed >> 16) & 0xff}.${(ipSeed >> 8) & 0xff}.${ipSeed & 0xff}`;
  const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-tool`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ANON_KEY}`,
      apikey: ANON_KEY,
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify({ toolId, input: SAMPLE_INPUT }),
  });
  return res;
}

describe("ai-tool backend regression (no 402, no empty output)", () => {
  // Network + streaming → give each tool plenty of time.
  TOOL_IDS.forEach((toolId, idx) => {
    it(
      `tool "${toolId}" returns a non-empty response and never 402`,
      async () => {
        const res = await callTool(toolId, 0xa10000 + idx);

        // Hard fail on the regression we're guarding against.
        expect(
          res.status,
          `${toolId} returned 402 Unauthorized — points/auth regression`,
        ).not.toBe(402);

        expect(
          res.ok,
          `${toolId} returned HTTP ${res.status} (${res.statusText})`,
        ).toBe(true);

        const content = await readStreamedContent(res);
        expect(
          content.trim().length,
          `${toolId} returned an empty body`,
        ).toBeGreaterThan(0);
      },
      60_000,
    );
  });
});
