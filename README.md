# TVK Tools

A points-based SaaS toolkit for the Indian market with 50+ AI-powered tools. Built with React, Vite, and Supabase.

## Self-Hosting Guide

### Prerequisites

- **Node.js** 18+ (or [Bun](https://bun.sh) 1.0+)
- A **Supabase project** with the required schema, edge functions, and auth configured
- A **Lovable Cloud / Lovable AI Gateway** API key (for AI-powered tools)

### 1. Clone & Install

```bash
git clone https://github.com/tvijaykumar545/tvktools.git
cd tvktools

# With Bun (recommended — used in project scripts)
bun install

# Or with npm
npm install
```

### 2. Environment Variables

Create a `.env` file in the project root with your Supabase credentials:

```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_URL="https://your-project.supabase.co"
```

> The **publishable (anon) key** is safe to expose in the browser bundle. It is used by the Supabase client for authentication and public data access. Row Level Security (RLS) policies enforce access control on the backend.

### 3. Local Development

```bash
# Start the dev server on port 8080
bun run dev

# Or with npm
npm run dev
```

The app will be available at `http://localhost:8080`.

### 4. Production Build

```bash
# Generate the sitemap and build static assets
bun run build

# Or with npm
npm run build
```

Output is written to the `dist/` directory. This is a **single-page application (SPA)** — any static file server must be configured to serve `index.html` for all unmatched routes.

### 5. Deployment Options

Deploy the contents of `dist/` to any static host:

| Platform | Notes |
|----------|-------|
| **Vercel** | SPA fallback is automatic |
| **Netlify** | Add `_redirects`: `/* /index.html 200` |
| **Cloudflare Pages** | SPA fallback is automatic |
| **AWS S3 + CloudFront** | Set error page to `index.html` |
| **Nginx** | Use `try_files $uri $uri/ /index.html;` |
| **GitHub Pages** | Works with `404.html` trick or hash router |

### 6. Backend Dependencies (Not Self-Hosted)

The following services run in the cloud and are **not included** in this static build:

| Service | Purpose | Setup Required |
|---------|---------|----------------|
| **Supabase** | Auth, PostgreSQL database, edge functions, storage | Create a project and deploy the edge functions in `supabase/functions/` |
| **Lovable AI Gateway** | AI completions for text/code/DAX/etc. | Set `LOVABLE_API_KEY` as a secret in your Supabase edge function environment |
| **Razorpay** | INR point purchases | Configure keys in Supabase secrets and edge function environment |

To fully replicate the backend, you will need to:
1. Set up a Supabase project with the same database schema and RLS policies.
2. Deploy all edge functions from `supabase/functions/`.
3. Configure the required secrets (`LOVABLE_API_KEY`, Razorpay keys, etc.) in the Supabase dashboard.

### 7. Running Tests

```bash
# Unit tests
bun run test

# Backend regression suite (requires CI secrets: TEST_USER_EMAIL, TEST_USER_PASSWORD)
bun run test:backend-regression
```

### Tech Stack

- [Vite](https://vitejs.dev/) — Build tool
- [React](https://react.dev/) — UI library
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [shadcn/ui](https://ui.shadcn.com/) — UI components
- [Supabase](https://supabase.com/) — Backend, auth, database
- [Lovable AI Gateway](https://ai.gateway.lovable.dev/) — AI model access

### License

This project is proprietary. All rights reserved.
