import { Link } from "react-router-dom";
import { BookOpen, Code, Zap, Key, Terminal } from "lucide-react";

const sections = [
  {
    icon: BookOpen,
    title: "Getting Started",
    items: [
      { title: "What is TVK Tools?", desc: "TVK Tools is a platform of 50+ AI, SEO, developer, and utility tools available for free or via subscription." },
      { title: "Do I need an account?", desc: "No! Many tools work without login. Create an account to access Pro tools, save results, and track usage." },
      { title: "How do tools work?", desc: "Frontend tools process data in your browser instantly. Backend tools use n8n workflows via secure webhooks." },
    ],
  },
  {
    icon: Code,
    title: "API Reference",
    items: [
      { title: "Authentication", desc: "API requests require a valid API key passed in the Authorization header. Get your key from the Dashboard." },
      { title: "Endpoints", desc: "Each tool is accessible via /api/tools/[tool-name]. Send a POST request with your input data." },
      { title: "Rate Limits", desc: "Free: 5 requests/min. Pro: 60 requests/min. Enterprise: Custom limits." },
    ],
  },
  {
    icon: Zap,
    title: "Tool Categories",
    items: [
      { title: "AI Tools", desc: "AI-powered content generation including prompts, blog titles, tweets, bios, and product descriptions." },
      { title: "SEO Tools", desc: "Keyword research, meta tag generation, SERP preview, keyword density analysis, and more." },
      { title: "Developer Tools", desc: "JSON formatting, Base64 encoding/decoding, JWT decoding, code minification, and timestamp conversion." },
      { title: "Image Tools", desc: "Image conversion, compression, resizing, metadata viewing, and Base64 conversion." },
      { title: "Utility Tools", desc: "QR codes, passwords, UUIDs, hashing, URL encoding, text case conversion, and more." },
    ],
  },
  {
    icon: Terminal,
    title: "API Example",
    items: [
      { title: "Request", desc: 'curl -X POST https://tvktools.com/api/tools/word-counter -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json" -d \'{"input": "Your text here"}\''},
      { title: "Response", desc: '{"success": true, "result": {"words": 3, "characters": 14, "sentences": 1}}' },
    ],
  },
  {
    icon: Key,
    title: "Plans & Pricing",
    items: [
      { title: "Free Plan", desc: "Access to 20+ basic tools with 5 uses per day. No API access." },
      { title: "Pro Plan ($19/mo)", desc: "All 50+ tools, unlimited usage, API access, priority processing, and saved results." },
      { title: "Enterprise", desc: "Custom integrations, dedicated support, SLA, white-label options, and bulk API access." },
    ],
  },
];

const Documentation = () => {
  return (
    <div className="cyber-grid min-h-screen py-16">
      <div className="container mx-auto px-4">
        <h1 className="font-heading text-3xl font-bold text-primary neon-text">Documentation</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Everything you need to know about TVK Tools platform and API.
        </p>

        {/* Quick nav */}
        <div className="mt-6 flex flex-wrap gap-2">
          {sections.map((s) => (
            <a
              key={s.title}
              href={`#${s.title.toLowerCase().replace(/ /g, "-")}`}
              className="rounded border border-primary/20 px-3 py-1.5 font-heading text-[10px] text-muted-foreground transition-all hover:border-primary/50 hover:text-primary"
            >
              {s.title}
            </a>
          ))}
        </div>

        <div className="mt-10 space-y-12">
          {sections.map((section) => (
            <section key={section.title} id={section.title.toLowerCase().replace(/ /g, "-")}>
              <div className="flex items-center gap-2">
                <section.icon className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-xl font-bold text-foreground">{section.title}</h2>
              </div>
              <div className="mt-4 space-y-4">
                {section.items.map((item) => (
                  <div key={item.title} className="rounded border border-primary/10 bg-card p-4 border-glow">
                    <h3 className="font-heading text-xs font-bold text-primary">{item.title}</h3>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed font-body break-all">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Documentation;
