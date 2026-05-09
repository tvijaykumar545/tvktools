
# TVK Tools — Public API Access Plan

## 1. Purpose

Expose TVK Tools' tool catalog programmatically so developers can integrate our utilities into their own apps, scripts, and workflows.

**Use cases**
- Run frontend-style tools (word counter, JSON formatter, hash, QR, password gen, etc.) headlessly from a backend.
- Run AI tools (blog title, prompt, summary, code helpers) and image generation from CI/CD, scripts, or 3rd-party SaaS.
- Query account state: points balance, usage history, available tools.
- Power the existing "API access" hint in `Documentation.tsx` and `Pricing` so it stops being marketing-only.

**Non-goals (v1)**
- No public webhook subscriptions.
- No admin/management endpoints (tool CRUD, user mgmt stay UI-only).
- No per-tool SDKs — just REST + examples.

---

## 2. Authentication

**Method:** Static bearer API keys, scoped to a user account, validated server-side in an Edge Function.

- User generates keys from a new **Dashboard → API Keys** page.
- Key shown **once** at creation (prefix + secret), then only the prefix + hash is stored.
- Sent as `Authorization: Bearer tvk_live_<key>`.
- Each call:
  1. Edge function hashes the key, looks it up in `api_keys`.
  2. Verifies key is active and not expired.
  3. Loads the owning `user_id` and applies normal points/quota rules to that user.
  4. Updates `last_used_at` + increments usage counter.
- Rate limiting: per-key sliding window (e.g. 60 req/min) using a `api_request_log` table or in-memory + DB fallback.
- Points: every billable call deducts from the owner's points balance (same `points_cost` as in-app).

**Why API keys, not OAuth:** end-users call our tools on behalf of *themselves only*. No 3rd-party-app-acting-as-user flow needed. OAuth can be added later without breaking keys.

---

## 3. Endpoints

Base URL: `https://xavthzgizngnmautbhmx.supabase.co/functions/v1/api-v1`
(Public-facing alias documented as `https://tvktools.tvktechnology.in/api/v1`.)

All routes require `Authorization: Bearer <key>` unless noted.

| Method | Path | Purpose | Body / Params |
|---|---|---|---|
| GET | `/me` | Current account: email, plan, points balance | — |
| GET | `/tools` | List active tools (id, name, category, points_cost, type) | `?category=ai` (optional) |
| GET | `/tools/:toolId` | Single tool metadata + input schema | — |
| POST | `/tools/:toolId/run` | Execute a frontend-style tool | `{ input: <string\|object> }` |
| POST | `/ai/run` | Run an AI tool (text) | `{ toolId, input, options? }` |
| POST | `/ai/image` | Run AI image generation | `{ prompt, size?, style? }` |
| GET | `/usage` | Recent usage history (paginated) | `?limit=50&cursor=...` |
| GET | `/points/balance` | Just the points balance | — |
| GET | `/health` | Liveness check (no auth) | — |

**Limits**
- Body ≤ 256 KB; AI image responses returned as base64 or signed URL.
- 60 req/min/key default; AI/image lower (e.g. 10 req/min).

---

## 4. Response Format

All JSON. Always returns an envelope so clients can branch on `success`.

**Success**
```json
{
  "success": true,
  "data": { /* endpoint-specific */ },
  "meta": { "request_id": "uuid", "points_charged": 2, "points_balance": 148 }
}
```

**Error**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_POINTS",
    "message": "Not enough points to run this tool.",
    "details": { "required": 5, "balance": 2 }
  },
  "meta": { "request_id": "uuid" }
}
```

**HTTP status mapping**
- 200 OK — successful run / fetch
- 400 `INVALID_INPUT` — Zod validation failure
- 401 `UNAUTHORIZED` — missing / bad key
- 403 `FORBIDDEN` — key disabled, tool inactive, plan-gated
- 402 `INSUFFICIENT_POINTS` — balance too low
- 404 `NOT_FOUND` — tool/resource missing
- 429 `RATE_LIMITED` — includes `Retry-After` header
- 500 `INTERNAL_ERROR` — generic, no stack leak (matches existing hardening)

Headers on every response: `X-Request-Id`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

---

## 5. Testing

**Layers**
1. **Unit** — Deno tests in `supabase/functions/api-v1/` (`*_test.ts`) for: key hashing, auth middleware, rate limiter, error envelope shape, points deduction.
2. **Integration** — `supabase--curl_edge_functions` against deployed function for each endpoint: happy path, missing auth, bad key, insufficient points, rate limit, invalid body.
3. **Frontend** — Vitest for the new API Keys UI (create / revoke / copy-once flow).
4. **Manual smoke** — Postman collection + a `curl` cheat sheet committed to `/docs/api/`.

**Environments**
- Dev: preview URL via Lovable Cloud test instance.
- Prod: published function on the live Supabase project, custom domain `tvktools.tvktechnology.in/api/v1`.

**Security checks**
- Run `security--run_security_scan` after migration.
- Verify RLS on `api_keys` (owner-only SELECT/DELETE, no UPDATE of `key_hash`, INSERT via SECURITY DEFINER RPC only).
- Confirm no raw secret logged anywhere (only prefix).

---

## 6. Documentation

Replace the placeholder content in `src/pages/Documentation.tsx` with a real, structured API reference, plus a dedicated landing section.

**Structure**
- **Quickstart** — create key → first `curl` to `/me` → first tool run.
- **Authentication** — header format, key rotation, revoke.
- **Endpoints reference** — one collapsible block per route with: description, params (table), example request (`curl`, JS `fetch`, Python `requests`), example response, error codes.
- **Rate limits & quotas** — table + headers explanation.
- **Points & billing** — how `points_cost` maps to API calls; link to BuyPoints page.
- **Errors** — full code list with remediation.
- **Changelog** — versioned (`/api/v1`); breaking changes bump major.

**Surfacing**
- Update `Documentation.tsx` with the new content (kept on-site, SEO-indexed, single H1).
- Add **Dashboard → API Keys** page with inline "Read the docs" link.
- Add CTA from `Pricing` and `Index` ("Build with our API").
- Add `/docs/api/openapi.yaml` (OpenAPI 3.1) so users can import into Postman/Insomnia.

---

## Technical implementation details

**New DB objects (migration)**
- `public.api_keys`: `id`, `user_id`, `name`, `key_prefix` (e.g. `tvk_live_ab12`), `key_hash` (sha256), `last_used_at`, `revoked_at`, `expires_at`, `created_at`. RLS: owner SELECT/UPDATE(name only)/DELETE; INSERT via `create_api_key(p_name)` SECURITY DEFINER RPC that returns the one-time plaintext.
- `public.api_request_log`: `id`, `api_key_id`, `user_id`, `endpoint`, `status`, `points_charged`, `created_at`. Indexed on `(api_key_id, created_at desc)` for rate limiting + `/usage`.
- Reuse existing `deduct_tool_points` RPC for charging.

**New Edge Function**
- `supabase/functions/api-v1/index.ts` — single function, internal router (`switch` on `req.url` path) for all `/api/v1/*` routes. `verify_jwt = false` (we validate our own bearer keys). CORS enabled. Zod-validated bodies. Reuses logic from existing `ai-tool` and `ai-image-gen` functions (factor shared bits into `_shared/`).

**Frontend additions**
- `src/pages/Dashboard.tsx`: new "API Keys" tab.
- `src/pages/ApiKeys.tsx` (or component): list, create modal (shows secret once with copy button + warning), revoke confirm.
- Update `Documentation.tsx` with full reference (replaces current placeholder).
- New route entry in `App.tsx`.

**Rollout order**
1. Migration (tables + RPCs + RLS).
2. Edge function `api-v1` with `/health`, `/me`, `/tools`, `/tools/:id/run`.
3. API Keys UI in Dashboard.
4. AI endpoints (`/ai/run`, `/ai/image`).
5. `/usage`, `/points/balance`.
6. Documentation page rewrite + OpenAPI spec.
7. Security scan + load test + announce.
