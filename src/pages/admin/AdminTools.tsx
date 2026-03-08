import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Shield, Star, Zap, Sparkles } from "lucide-react";
import { tools as allTools, type Tool, type ToolCategory } from "@/data/tools";
import { useToast } from "@/hooks/use-toast";

const AdminTools = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [toolList, setToolList] = useState<Tool[]>([]);
  const [filter, setFilter] = useState<ToolCategory | "all">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) navigate("/login");
      else if (!isAdmin) navigate("/dashboard");
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  useEffect(() => {
    setToolList([...allTools]);
  }, []);

  const filtered = toolList.filter((t) => {
    if (filter !== "all" && t.category !== filter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleProp = (id: string, prop: "isFree" | "isPopular" | "isNew") => {
    setToolList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [prop]: !t[prop] } : t))
    );
    toast({ title: "Tool updated", description: `Note: Changes are session-only. Edit src/data/tools.ts for permanent changes.` });
  };

  if (authLoading || adminLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="font-heading text-sm text-primary animate-pulse-neon">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const categories: { value: ToolCategory | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "ai", label: "AI" },
    { value: "seo", label: "SEO" },
    { value: "developer", label: "Developer" },
    { value: "image", label: "Image" },
    { value: "utility", label: "Utility" },
  ];

  return (
    <div className="cyber-grid min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Link to="/admin" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-3 w-3" /> Back to Admin
        </Link>

        <h1 className="mt-4 font-heading text-2xl font-bold text-secondary neon-text-magenta flex items-center gap-2">
          <Shield className="h-6 w-6" /> Tool Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{toolList.length} tools configured</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools..."
            className="h-9 rounded border border-primary/20 bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50 sm:w-64"
          />
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFilter(cat.value)}
                className={`rounded px-3 py-1.5 font-heading text-[10px] font-semibold transition-all ${
                  filter === cat.value
                    ? "bg-primary text-primary-foreground"
                    : "border border-primary/20 text-muted-foreground hover:text-primary"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-2">
          {filtered.map((tool) => (
            <div
              key={tool.id}
              className="flex flex-col gap-2 rounded border border-primary/10 bg-card p-3 sm:flex-row sm:items-center sm:justify-between border-glow"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{tool.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-xs font-bold text-foreground">{tool.name}</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 font-heading text-[9px] uppercase text-muted-foreground">
                      {tool.type}
                    </span>
                    <span className="rounded bg-muted px-1.5 py-0.5 font-heading text-[9px] uppercase text-muted-foreground">
                      {tool.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{tool.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleProp(tool.id, "isFree")}
                  className={`flex items-center gap-1 rounded px-2 py-1 font-heading text-[10px] font-bold transition-all ${
                    tool.isFree
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary/20 text-secondary"
                  }`}
                  title={tool.isFree ? "Free" : "Pro"}
                >
                  <Zap className="h-3 w-3" />
                  {tool.isFree ? "Free" : "Pro"}
                </button>
                <button
                  onClick={() => toggleProp(tool.id, "isPopular")}
                  className={`flex items-center gap-1 rounded px-2 py-1 font-heading text-[10px] font-bold transition-all ${
                    tool.isPopular ? "bg-accent/20 text-accent-foreground" : "bg-muted text-muted-foreground"
                  }`}
                  title="Popular"
                >
                  <Star className="h-3 w-3" />
                </button>
                <button
                  onClick={() => toggleProp(tool.id, "isNew")}
                  className={`flex items-center gap-1 rounded px-2 py-1 font-heading text-[10px] font-bold transition-all ${
                    tool.isNew ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                  title="New"
                >
                  <Sparkles className="h-3 w-3" />
                </button>
                <Link
                  to={`/tool/${tool.id}`}
                  className="rounded px-2 py-1 text-[10px] text-muted-foreground hover:text-primary"
                >
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminTools;
