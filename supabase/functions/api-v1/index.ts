// TVK Tools Public API v1
// Bearer-token authenticated REST API for programmatic access.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const aiPrompts: Record<string, string> = {
  "ai-prompt-generator": "You are an expert prompt engineer. Generate 3 highly optimized, detailed prompts.",
  "ai-blog-title": "You are a content marketing expert. Generate 10 catchy, SEO-friendly blog titles.",
  "ai-image-prompt": "You are an expert at writing prompts for AI image generators. Generate 3 detailed prompts.",
  "ai-tweet-generator": "You are a social media expert. Generate 5 engaging tweet ideas under 280 chars.",
  "ai-hashtag-generator": "You are a social media strategist. Generate 30 relevant hashtags by tier.",
  "ai-bio-generator": "You are a personal branding expert. Generate 3 professional bios (short/medium/long).",
  "ai-product-desc": "You are an expert copywriter. Generate 3 product descriptions (50/100/200 words).",
  "ai-email-generator": "You are a communication expert. Generate a professional email, formal and semi-formal variants.",
  "ai-code-generator": "You are an expert programmer. Generate clean, well-commented code with brief explanations.",
  "ai-chat": "You are a helpful AI assistant. Use markdown when helpful.",
  "keyword-suggestions": "You are an SEO expert. Generate 20 keyword suggestions by intent.",
  "seo-title-generator": "You are an SEO specialist. Generate 10 SEO-optimized titles under 60 chars.",
  "ai-code-reviewer": "You are a senior engineer doing a thorough code review.",
  "ai-regex-generator": "You are a regex expert. Generate the pattern with explanation and examples.",
  "ai-sql-generator": "You are an expert SQL developer (PostgreSQL default).",
  "ai-code-explainer": "You are a patient programming teacher. Explain the code clearly.",
  "ai-dax-generator": "You are a Power BI DAX expert. Use VAR/RETURN and DIVIDE.",
  "ai-power-query-generator": "You are a Power Query M code expert.",
};

const RATE_LIMIT_PER_MIN = 60;
const AI_RATE_LIMIT_PER_MIN = 10;

function reqId() { return crypto.randomUUID(); }

function jsonResponse(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extraHeaders },
  });
}

function ok(data: unknown, meta: Record<string, unknown> = {}) {
  return jsonResponse({ success: true, data, meta: { request_id: reqId(), ...meta } });
}

function fail(code: string, message: string, status: number, details?: unknown, extraHeaders: Record<string, string> = {}) {
  return jsonResponse({
    success: false,
    error: { code, message, ...(details ? { details } : {}) },
    meta: { request_id: reqId() },
  }, status, extraHeaders);
}

const service = createClient(SUPABASE_URL, SERVICE_KEY);

async function authenticate(req: Request) {
  const h = req.headers.get("Authorization") || "";
  if (!h.startsWith("Bearer ")) return { error: fail("UNAUTHORIZED", "Missing bearer token.", 401) };
  const token = h.slice(7).trim();
  if (!token.startsWith("tvk_live_")) return { error: fail("UNAUTHORIZED", "Invalid API key format.", 401) };
  const { data, error } = await service.rpc("verify_api_key", { p_plain: token });
  if (error || !data || (Array.isArray(data) && data.length === 0)) {
    return { error: fail("UNAUTHORIZED", "Invalid or revoked API key.", 401) };
  }
  const row = Array.isArray(data) ? data[0] : data;
  return { apiKeyId: row.api_key_id as string, userId: row.user_id as string };
}

async function checkRateLimit(apiKeyId: string, perMinute: number) {
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count } = await service
    .from("api_request_log")
    .select("id", { count: "exact", head: true })
    .eq("api_key_id", apiKeyId)
    .gte("created_at", since);
  const used = count ?? 0;
  const remaining = Math.max(0, perMinute - used);
  return { allowed: used < perMinute, remaining, limit: perMinute };
}

async function logRequest(apiKeyId: string, userId: string, endpoint: string, method: string, status: number, pointsCharged = 0) {
  await service.from("api_request_log").insert({
    api_key_id: apiKeyId, user_id: userId, endpoint, method, status, points_charged: pointsCharged,
  });
}

// ---------- Route handlers ----------

async function handleMe(userId: string) {
  const { data: profile } = await service
    .from("profiles")
    .select("display_name, plan, points_balance")
    .eq("user_id", userId)
    .single();
  return ok({
    user_id: userId,
    display_name: profile?.display_name ?? null,
    plan: profile?.plan ?? "free",
    points_balance: profile?.points_balance ?? 0,
  });
}

async function handlePointsBalance(userId: string) {
  const { data } = await service.from("profiles").select("points_balance").eq("user_id", userId).single();
  return ok({ points_balance: data?.points_balance ?? 0 });
}

async function handleListTools(url: URL) {
  const category = url.searchParams.get("category");
  let q = service.from("managed_tools").select("id,name,description,category,type,points_cost,is_free,is_popular,is_new").eq("is_active", true).order("sort_order", { ascending: true });
  if (category) q = q.eq("category", category);
  const { data, error } = await q;
  if (error) return fail("INTERNAL_ERROR", "Failed to list tools.", 500);
  return ok({ tools: data ?? [] });
}

async function handleGetTool(toolId: string) {
  const { data } = await service.from("managed_tools").select("id,name,description,category,type,points_cost,is_free,is_popular,is_new,is_active").eq("id", toolId).maybeSingle();
  if (!data || !data.is_active) return fail("NOT_FOUND", "Tool not found.", 404);
  const inputSchema = aiPrompts[toolId]
    ? { input: { type: "string", required: true, max: 4000, description: "Plain-text prompt for the tool." } }
    : { input: { type: "string|object", required: true, description: "Tool-specific input." } };
  return ok({ tool: data, input_schema: inputSchema });
}

async function handleRunAI(userId: string, body: any) {
  const toolId = String(body?.toolId ?? "");
  const input = body?.input;
  if (!toolId || !aiPrompts[toolId]) return { resp: fail("INVALID_INPUT", "Unknown or non-AI tool.", 400), points: 0 };
  if (typeof input !== "string" || input.trim().length === 0 || input.length > 4000) {
    return { resp: fail("INVALID_INPUT", "Input must be a non-empty string ≤ 4000 chars.", 400), points: 0 };
  }
  // Cost
  const { data: toolRow } = await service.from("managed_tools").select("name, points_cost, is_active").eq("id", toolId).maybeSingle();
  if (!toolRow || !toolRow.is_active) return { resp: fail("NOT_FOUND", "Tool not available.", 404), points: 0 };
  const cost = toolRow.points_cost ?? 0;
  if (cost > 0) {
    const { data: dd } = await service.rpc("api_deduct_points", {
      p_user_id: userId, p_tool_id: toolId, p_tool_name: toolRow.name, p_points_cost: cost,
    });
    if (!(dd as any)?.success) {
      return { resp: fail("INSUFFICIENT_POINTS", "Not enough points to run this tool.", 402, dd), points: 0 };
    }
  }

  if (!LOVABLE_API_KEY) return { resp: fail("INTERNAL_ERROR", "AI gateway not configured.", 500), points: cost };

  const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: aiPrompts[toolId] }, { role: "user", content: input }],
      stream: false,
    }),
  });
  if (!aiResp.ok) {
    const status = aiResp.status === 429 ? 429 : aiResp.status === 402 ? 402 : 502;
    const code = aiResp.status === 429 ? "RATE_LIMITED" : aiResp.status === 402 ? "AI_CREDITS_EXHAUSTED" : "UPSTREAM_ERROR";
    return { resp: fail(code, "AI gateway request failed.", status), points: cost };
  }
  const aiJson = await aiResp.json();
  const text = aiJson?.choices?.[0]?.message?.content ?? "";

  // Fetch updated balance
  const { data: prof } = await service.from("profiles").select("points_balance").eq("user_id", userId).single();
  return {
    resp: ok({ tool_id: toolId, output: text }, { points_charged: cost, points_balance: prof?.points_balance ?? 0 }),
    points: cost,
  };
}

async function handleUsage(userId: string, url: URL) {
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10) || 50, 200);
  const { data } = await service
    .from("api_request_log")
    .select("endpoint, method, status, points_charged, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return ok({ items: data ?? [] });
}

// ---------- Router ----------

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  // Path after /functions/v1/api-v1
  const path = url.pathname.replace(/^.*\/api-v1/, "") || "/";

  try {
    // Public health
    if (path === "/health" && req.method === "GET") {
      return ok({ status: "ok", time: new Date().toISOString() });
    }

    const auth = await authenticate(req);
    if ("error" in auth) return auth.error;
    const { apiKeyId, userId } = auth;

    // Rate limit (AI routes get a tighter bucket)
    const isAI = path === "/ai/run" || path === "/ai/image";
    const rl = await checkRateLimit(apiKeyId, isAI ? AI_RATE_LIMIT_PER_MIN : RATE_LIMIT_PER_MIN);
    const rlHeaders = {
      "X-RateLimit-Limit": String(rl.limit),
      "X-RateLimit-Remaining": String(rl.remaining),
    };
    if (!rl.allowed) {
      await logRequest(apiKeyId, userId, path, req.method, 429);
      return fail("RATE_LIMITED", "Too many requests.", 429, undefined, { ...rlHeaders, "Retry-After": "60" });
    }

    let resp: Response;
    let points = 0;

    if (path === "/me" && req.method === "GET") {
      resp = await handleMe(userId);
    } else if (path === "/points/balance" && req.method === "GET") {
      resp = await handlePointsBalance(userId);
    } else if (path === "/tools" && req.method === "GET") {
      resp = await handleListTools(url);
    } else if (path === "/usage" && req.method === "GET") {
      resp = await handleUsage(userId, url);
    } else if (path.startsWith("/tools/") && path.endsWith("/run") && req.method === "POST") {
      const toolId = path.slice("/tools/".length, -"/run".length);
      let body: any = {};
      try { body = await req.json(); } catch { /* ignore */ }
      // Frontend-style tool run: only AI tools currently supported via API
      if (aiPrompts[toolId]) {
        const r = await handleRunAI(userId, { toolId, input: body?.input });
        resp = r.resp; points = r.points;
      } else {
        resp = fail("NOT_FOUND", "This tool is not available via API yet.", 404);
      }
    } else if (path.startsWith("/tools/") && req.method === "GET") {
      const toolId = path.slice("/tools/".length);
      resp = await handleGetTool(toolId);
    } else if (path === "/ai/run" && req.method === "POST") {
      let body: any = {};
      try { body = await req.json(); } catch { /* ignore */ }
      const r = await handleRunAI(userId, body);
      resp = r.resp; points = r.points;
    } else {
      resp = fail("NOT_FOUND", `No route for ${req.method} ${path}.`, 404);
    }

    // Attach rate-limit headers and log
    const newHeaders = new Headers(resp.headers);
    newHeaders.set("X-RateLimit-Limit", rlHeaders["X-RateLimit-Limit"]);
    newHeaders.set("X-RateLimit-Remaining", rlHeaders["X-RateLimit-Remaining"]);
    const finalResp = new Response(resp.body, { status: resp.status, headers: newHeaders });
    await logRequest(apiKeyId, userId, path, req.method, finalResp.status, points);
    return finalResp;
  } catch (e) {
    console.error("api-v1 error:", e);
    return fail("INTERNAL_ERROR", "An internal error occurred.", 500);
  }
});
