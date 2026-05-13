// Generates public/sitemap.xml. Runs via predev/prebuild.
import { writeFileSync } from "fs";
import { resolve } from "path";
import { tools as staticTools, categories } from "../src/data/tools";

const BASE_URL = "https://tvktools.tvktechnology.in";
const SUPABASE_URL = "https://xavthzgizngnmautbhmx.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhdnRoemdpem5nbm1hdXRiaG14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NzI5OTMsImV4cCI6MjA4ODU0ODk5M30.qGLYYyG5AL-Ho0XIsK-t0YqyOaV8ujIvoz6Jgwxo_Ks";

interface Entry { path: string; changefreq?: string; priority?: string; lastmod?: string; }

const staticEntries: Entry[] = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/tools", priority: "0.9", changefreq: "weekly" },
  { path: "/categories", priority: "0.8", changefreq: "weekly" },
  { path: "/pricing", priority: "0.7", changefreq: "monthly" },
  { path: "/buy-points", priority: "0.7", changefreq: "monthly" },
  { path: "/blog", priority: "0.7", changefreq: "weekly" },
  { path: "/about", priority: "0.5", changefreq: "monthly" },
  { path: "/contact", priority: "0.5", changefreq: "monthly" },
  { path: "/documentation", priority: "0.6", changefreq: "monthly" },
  { path: "/api-access", priority: "0.5", changefreq: "monthly" },
  { path: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms-conditions", priority: "0.3", changefreq: "yearly" },
  { path: "/login", priority: "0.4", changefreq: "monthly" },
  { path: "/signup", priority: "0.5", changefreq: "monthly" },
];

const categoryEntries: Entry[] = categories.map((c) => ({
  path: `/categories/${c.id}`, priority: "0.7", changefreq: "weekly",
}));

const toolEntries: Entry[] = staticTools.map((t) => ({
  path: `/tool/${t.id}`, priority: t.isPopular ? "0.8" : "0.6", changefreq: "monthly",
}));

async function fetchBlogSlugs(): Promise<Entry[]> {
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,updated_at&published=eq.true`,
      { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } }
    );
    if (!r.ok) return [];
    const rows: Array<{ slug: string; updated_at: string }> = await r.json();
    return rows.map((p) => ({
      path: `/blog/${p.slug}`, priority: "0.6", changefreq: "monthly",
      lastmod: p.updated_at?.slice(0, 10),
    }));
  } catch { return []; }
}

function render(entries: Entry[]) {
  const urls = entries.map((e) =>
    `  <url>\n    <loc>${BASE_URL}${e.path}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ""}${e.changefreq ? `\n    <changefreq>${e.changefreq}</changefreq>` : ""}${e.priority ? `\n    <priority>${e.priority}</priority>` : ""}\n  </url>`
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

(async () => {
  const blogEntries = await fetchBlogSlugs();
  const all = [...staticEntries, ...categoryEntries, ...toolEntries, ...blogEntries];
  writeFileSync(resolve("public/sitemap.xml"), render(all));
  console.log(`sitemap.xml written (${all.length} entries, ${blogEntries.length} blog posts)`);
})();
