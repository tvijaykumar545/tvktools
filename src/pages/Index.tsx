import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight, Zap, Shield, Globe } from "lucide-react";
import { tools, categories, getPopularTools, getNewTools } from "@/data/tools";
import ToolCard from "@/components/ToolCard";

const Index = () => {
  const [search, setSearch] = useState("");
  const popular = getPopularTools();
  const newTools = getNewTools();

  const filtered = search
    ? tools.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.description.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 6)
    : [];

  return (
    <div className="cyber-grid">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl animate-slide-up">
            <div className="mb-4 inline-block rounded border border-primary/30 bg-primary/10 px-3 py-1 font-heading text-[10px] font-semibold uppercase tracking-widest text-primary">
              50+ AI-Powered Tools
            </div>
            <h1 className="font-heading text-3xl font-black leading-tight text-primary neon-text md:text-5xl lg:text-6xl">
              TVK Tools — AI Tools for
              <br />
              <span className="text-secondary neon-text-magenta">SEO, Developers</span>
              <span className="text-foreground"> & </span>
              <span className="text-accent">Creators</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-sm text-muted-foreground md:text-base">
              Convert, analyze, generate, and optimize using powerful AI tools.
              Free to use. No signup required for basic tools.
            </p>

            {/* Search */}
            <div className="relative mx-auto mt-8 max-w-xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/50" />
              <input
                type="text"
                placeholder="Search 50+ tools..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 w-full rounded border border-primary/30 bg-card pl-12 pr-4 font-body text-sm text-foreground placeholder-muted-foreground outline-none transition-all focus:border-primary/60 focus:neon-glow"
              />
              {search && filtered.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded border border-primary/20 bg-card p-2 shadow-xl">
                  {filtered.map((tool) => (
                    <Link
                      key={tool.id}
                      to={`/tool/${tool.id}`}
                      className="flex items-center gap-3 rounded px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
                    >
                      <span>{tool.icon}</span>
                      <div>
                        <div className="font-heading text-xs font-semibold">{tool.name}</div>
                        <div className="text-[10px]">{tool.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/tools"
                className="flex items-center gap-2 rounded bg-primary px-6 py-3 font-heading text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90 neon-glow"
              >
                Explore All Tools
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/pricing"
                className="flex items-center gap-2 rounded border border-secondary/50 px-6 py-3 font-heading text-xs font-bold text-secondary transition-all hover:bg-secondary/10 neon-glow-magenta"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-primary/10 bg-card/50 py-8">
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-8 px-4 md:gap-16">
          {[
            { icon: Zap, label: "50+ Tools", desc: "Ready to use" },
            { icon: Shield, label: "Free Access", desc: "No login needed" },
            { icon: Globe, label: "n8n Powered", desc: "Automated workflows" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <stat.icon className="h-6 w-6 text-primary" />
              <div>
                <div className="font-heading text-sm font-bold text-foreground">{stat.label}</div>
                <div className="text-xs text-muted-foreground">{stat.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center font-heading text-2xl font-bold text-primary neon-text">
            Tool Categories
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Browse tools by category
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/categories/${cat.id}`}
                className="group flex flex-col items-center gap-3 rounded border border-primary/10 bg-card p-6 text-center transition-all duration-300 hover:border-primary/40 hover:bg-surface-hover border-glow"
              >
                <cat.icon className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                <div>
                  <div className="font-heading text-xs font-bold text-foreground group-hover:text-primary">
                    {cat.name}
                  </div>
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    {cat.toolCount} tools
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tools */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold text-primary neon-text">
                Popular Tools
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Most used by our community</p>
            </div>
            <Link
              to="/tools"
              className="flex items-center gap-1 text-xs text-primary transition-all hover:gap-2"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {popular.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      {/* New Tools */}
      {newTools.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-2xl font-bold text-accent">
              ✨ New Tools
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Recently added</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {newTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl rounded border border-primary/20 bg-card p-8 text-center gradient-cyber neon-glow md:p-12">
            <h2 className="font-heading text-xl font-bold text-primary neon-text md:text-3xl">
              Ready to supercharge your workflow?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Get unlimited access to all 50+ tools with TVK Pro.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/signup"
                className="rounded bg-primary px-8 py-3 font-heading text-xs font-bold text-primary-foreground neon-glow"
              >
                Get Started Free
              </Link>
              <Link
                to="/pricing"
                className="rounded border border-primary/30 px-8 py-3 font-heading text-xs font-bold text-primary"
              >
                See Plans
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
