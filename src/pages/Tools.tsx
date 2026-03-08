import { useState } from "react";
import { Search } from "lucide-react";
import { tools as staticTools, categories, type ToolCategory } from "@/data/tools";
import ToolCard from "@/components/ToolCard";
import { useManagedTools } from "@/hooks/useManagedTools";

const Tools = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "all">("all");
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const { data: dbTools } = useManagedTools();
  const tools = dbTools && dbTools.length > 0 ? dbTools : staticTools;

  const filtered = tools.filter((t) => {
    if (activeCategory !== "all" && t.category !== activeCategory) return false;
    if (showFreeOnly && !t.isFree) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="cyber-grid min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-primary neon-text">All Tools</h1>
          <p className="mt-1 text-sm text-muted-foreground">Browse and search 50+ tools</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded border border-primary/20 bg-card pl-10 pr-4 text-sm text-foreground outline-none transition-all focus:border-primary/50"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`rounded px-3 py-1.5 font-heading text-[10px] font-semibold transition-all ${
                activeCategory === "all" ? "bg-primary text-primary-foreground neon-glow" : "border border-primary/20 text-muted-foreground hover:text-primary"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded px-3 py-1.5 font-heading text-[10px] font-semibold transition-all ${
                  activeCategory === cat.id ? "bg-primary text-primary-foreground neon-glow" : "border border-primary/20 text-muted-foreground hover:text-primary"
                }`}
              >
                {cat.name}
              </button>
            ))}
            <button
              onClick={() => setShowFreeOnly(!showFreeOnly)}
              className={`rounded px-3 py-1.5 font-heading text-[10px] font-semibold transition-all ${
                showFreeOnly ? "bg-accent text-accent-foreground" : "border border-primary/20 text-muted-foreground hover:text-primary"
              }`}
            >
              Free Only
            </button>
          </div>
        </div>

        <div className="mb-4 text-xs text-muted-foreground">
          {filtered.length} tools found
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            No tools found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default Tools;
