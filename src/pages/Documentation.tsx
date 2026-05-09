import { Link } from "react-router-dom";
import { BookOpen, Key, Zap, Code, AlertTriangle, Coins, Activity } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const BASE = "https://xavthzgizngnmautbhmx.supabase.co/functions/v1/api-v1";

const Endpoint = ({
  method,
  path,
  desc,
  example,
  response,
}: {
  method: string;
  path: string;
  desc: string;
  example: string;
  response: string;
}) => (
  <div className="rounded border border-primary/15 bg-card p-4 border-glow">
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`rounded px-2 py-0.5 font-heading text-[10px] font-bold ${
        method === "GET" ? "bg-primary/10 text-primary" : "bg-secondary/15 text-secondary"
      }`}>
        {method}
      </span>
      <code className="font-mono text-xs text-foreground break-all">{path}</code>
    </div>
    <p className="mt-2 text-xs text-muted-foreground">{desc}</p>
    <div className="mt-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Example</div>
      <pre className="mt-1 overflow-x-auto rounded bg-background border border-primary/10 p-3 text-[11px] text-foreground"><code>{example}</code></pre>
    </div>
    <div className="mt-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Response</div>
      <pre className="mt-1 overflow-x-auto rounded bg-background border border-primary/10 p-3 text-[11px] text-foreground"><code>{response}</code></pre>
    </div>
  </div>
);

const Documentation = () => {
  return (
    <>
      <SEOHead
        title="API Documentation — TVK Tools Developer API"
        description="Use the TVK Tools REST API to run AI tools, look up tool catalog, and manage points programmatically with simple API key authentication."
        canonical="https://tvktools.tvktechnology.in/documentation"
      />
      <div className="cyber-grid min-h-screen py-12">
        <div className="container mx-auto max-w-5xl px-4">
          <h1 className="font-heading text-3xl font-bold text-primary neon-text">API Documentation</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Programmatic access to TVK Tools — run AI tools, query your account, and integrate with your own apps.
          </p>

          {/* Quick nav */}
          <nav className="mt-6 flex flex-wrap gap-2">
            {[
              ["quickstart", "Quickstart"],
              ["auth", "Authentication"],
              ["endpoints", "Endpoints"],
              ["responses", "Responses"],
              ["rate-limits", "Rate limits"],
              ["points", "Points & billing"],
              ["errors", "Errors"],
            ].map(([id, label]) => (
              <a key={id} href={`#${id}`} className="rounded border border-primary/20 px-3 py-1.5 font-heading text-[10px] text-muted-foreground hover:border-primary/50 hover:text-primary">
                {label}
              </a>
            ))}
          </nav>

          {/* Quickstart */}
          <section id="quickstart" className="mt-12">
            <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" /> Quickstart
            </h2>
            <ol className="mt-4 space-y-3 text-sm text-muted-foreground list-decimal list-inside">
              <li>
                Create a key on the <Link to="/api-access" className="text-primary hover:underline">API Access</Link> page. Copy it immediately — it won't be shown again.
              </li>
              <li>Send your first request:</li>
            </ol>
            <pre className="mt-3 overflow-x-auto rounded bg-background border border-primary/15 p-4 text-[12px] text-foreground"><code>{`curl ${BASE}/me \\
  -H "Authorization: Bearer tvk_live_..."`}</code></pre>
            <p className="mt-3 text-xs text-muted-foreground">
              Base URL: <code className="text-primary break-all">{BASE}</code>
            </p>
          </section>

          {/* Auth */}
          <section id="auth" className="mt-12">
            <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" /> Authentication
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              All endpoints (except <code>/health</code>) require an API key sent in the <code>Authorization</code> header:
            </p>
            <pre className="mt-3 overflow-x-auto rounded bg-background border border-primary/15 p-4 text-[12px] text-foreground"><code>Authorization: Bearer tvk_live_xxxxxxxxxxxxxxxxxxxxxxxx</code></pre>
            <div className="mt-4 rounded border border-yellow-500/40 bg-yellow-500/5 p-3 flex gap-2 text-xs">
              <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
              <span className="text-muted-foreground">
                Treat keys like passwords. Never commit them to source control or expose them in browser code. To rotate, create a new key, swap it in, then revoke the old one from the <Link to="/api-access" className="text-primary hover:underline">API Access</Link> page.
              </span>
            </div>
          </section>

          {/* Endpoints */}
          <section id="endpoints" className="mt-12">
            <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" /> Endpoints
            </h2>
            <div className="mt-4 space-y-4">
              <Endpoint
                method="GET"
                path="/health"
                desc="Liveness check. No authentication required."
                example={`curl ${BASE}/health`}
                response={`{ "success": true, "data": { "status": "ok", "time": "..." } }`}
              />
              <Endpoint
                method="GET"
                path="/me"
                desc="Returns the account that owns the API key (display name, plan, points balance)."
                example={`curl ${BASE}/me -H "Authorization: Bearer $TVK_KEY"`}
                response={`{
  "success": true,
  "data": { "user_id": "...", "display_name": "Jane", "plan": "free", "points_balance": 148 }
}`}
              />
              <Endpoint
                method="GET"
                path="/points/balance"
                desc="Just the points balance — handy for monitoring scripts."
                example={`curl ${BASE}/points/balance -H "Authorization: Bearer $TVK_KEY"`}
                response={`{ "success": true, "data": { "points_balance": 148 } }`}
              />
              <Endpoint
                method="GET"
                path="/tools"
                desc="List active tools. Optional query param: ?category=ai-tools."
                example={`curl "${BASE}/tools?category=ai-tools" -H "Authorization: Bearer $TVK_KEY"`}
                response={`{ "success": true, "data": { "tools": [ { "id": "ai-blog-title", "name": "Blog Title Generator", "points_cost": 2, ... } ] } }`}
              />
              <Endpoint
                method="GET"
                path="/tools/:toolId"
                desc="Single tool metadata + input schema."
                example={`curl ${BASE}/tools/ai-blog-title -H "Authorization: Bearer $TVK_KEY"`}
                response={`{ "success": true, "data": { "tool": {...}, "input_schema": { "input": { "type": "string", "max": 4000 } } } }`}
              />
              <Endpoint
                method="POST"
                path="/ai/run"
                desc="Run an AI text tool. Body: { toolId, input }. Charges the tool's points_cost."
                example={`curl -X POST ${BASE}/ai/run \\
  -H "Authorization: Bearer $TVK_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"toolId":"ai-blog-title","input":"sustainable gardening for beginners"}'`}
                response={`{
  "success": true,
  "data": { "tool_id": "ai-blog-title", "output": "1. 10 Easy..." },
  "meta": { "points_charged": 2, "points_balance": 146, "request_id": "..." }
}`}
              />
              <Endpoint
                method="POST"
                path="/tools/:toolId/run"
                desc="Convenience alias for /ai/run when the tool id is in the path."
                example={`curl -X POST ${BASE}/tools/ai-blog-title/run \\
  -H "Authorization: Bearer $TVK_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"input":"sustainable gardening"}'`}
                response={`{ "success": true, "data": { "tool_id": "...", "output": "..." } }`}
              />
              <Endpoint
                method="GET"
                path="/usage"
                desc="Recent API request log for the calling account. Query params: limit (max 200)."
                example={`curl "${BASE}/usage?limit=20" -H "Authorization: Bearer $TVK_KEY"`}
                response={`{ "success": true, "data": { "items": [ { "endpoint": "/ai/run", "status": 200, "points_charged": 2, "created_at": "..." } ] } }`}
              />
            </div>
          </section>

          {/* Responses */}
          <section id="responses" className="mt-12">
            <h2 className="font-heading text-xl font-bold text-foreground">Response format</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Every response is a JSON envelope with a top-level <code>success</code> boolean.
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Success</div>
                <pre className="mt-1 rounded bg-background border border-primary/15 p-3 text-[11px] text-foreground"><code>{`{
  "success": true,
  "data": { ... },
  "meta": {
    "request_id": "uuid",
    "points_charged": 2,
    "points_balance": 148
  }
}`}</code></pre>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Error</div>
                <pre className="mt-1 rounded bg-background border border-primary/15 p-3 text-[11px] text-foreground"><code>{`{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_POINTS",
    "message": "Not enough points.",
    "details": { "balance": 1, "cost": 2 }
  },
  "meta": { "request_id": "uuid" }
}`}</code></pre>
              </div>
            </div>
          </section>

          {/* Rate limits */}
          <section id="rate-limits" className="mt-12">
            <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Rate limits
            </h2>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>Standard endpoints: <strong>60 requests / minute / key</strong>.</li>
              <li>AI endpoints (<code>/ai/run</code>, <code>/tools/:id/run</code>): <strong>10 requests / minute / key</strong>.</li>
              <li>Every response includes <code>X-RateLimit-Limit</code> and <code>X-RateLimit-Remaining</code> headers.</li>
              <li>Hitting a limit returns HTTP <strong>429</strong> with a <code>Retry-After</code> header.</li>
            </ul>
          </section>

          {/* Points */}
          <section id="points" className="mt-12">
            <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" /> Points & billing
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              API calls deduct from the same points balance you see in the app. Each tool advertises its <code>points_cost</code>{" "}
              via <code>GET /tools</code>. Top up anytime from{" "}
              <Link to="/buy-points" className="text-primary hover:underline">Buy Points</Link>.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Read-only endpoints (<code>/me</code>, <code>/tools</code>, <code>/usage</code>, <code>/points/balance</code>, <code>/health</code>) are free.
            </p>
          </section>

          {/* Errors */}
          <section id="errors" className="mt-12">
            <h2 className="font-heading text-xl font-bold text-foreground">Error codes</h2>
            <div className="mt-3 overflow-x-auto rounded border border-primary/15">
              <table className="w-full text-xs">
                <thead className="bg-muted/30 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left font-heading">HTTP</th>
                    <th className="px-3 py-2 text-left font-heading">Code</th>
                    <th className="px-3 py-2 text-left font-heading">Meaning</th>
                  </tr>
                </thead>
                <tbody className="text-foreground">
                  {[
                    ["400", "INVALID_INPUT", "Body or query failed validation."],
                    ["401", "UNAUTHORIZED", "Missing, malformed, or revoked API key."],
                    ["402", "INSUFFICIENT_POINTS", "Account does not have enough points for this call."],
                    ["402", "AI_CREDITS_EXHAUSTED", "Upstream AI provider out of credits — try again later."],
                    ["404", "NOT_FOUND", "Tool or route does not exist."],
                    ["429", "RATE_LIMITED", "Per-key rate limit exceeded. Honor Retry-After."],
                    ["500", "INTERNAL_ERROR", "Unexpected server error."],
                    ["502", "UPSTREAM_ERROR", "AI gateway returned an error."],
                  ].map(([http, code, m]) => (
                    <tr key={code} className="border-t border-primary/10">
                      <td className="px-3 py-2 font-mono">{http}</td>
                      <td className="px-3 py-2 font-mono text-primary">{code}</td>
                      <td className="px-3 py-2 text-muted-foreground">{m}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Footer CTA */}
          <div className="mt-14 rounded border border-primary/20 bg-card p-6 text-center border-glow">
            <BookOpen className="mx-auto h-6 w-6 text-primary" />
            <h3 className="mt-2 font-heading text-lg font-bold text-foreground">Ready to build?</h3>
            <p className="mt-1 text-sm text-muted-foreground">Generate your first key and make your first request in under a minute.</p>
            <Link
              to="/api-access"
              className="mt-4 inline-block rounded bg-primary px-6 py-2 font-heading text-xs font-bold text-primary-foreground"
            >
              Get an API key
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Documentation;
