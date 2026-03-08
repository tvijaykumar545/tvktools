import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Shield, BarChart3, TrendingUp } from "lucide-react";

interface ToolStat {
  tool_name: string;
  count: number;
}

interface CategoryStat {
  category: string;
  count: number;
}

const AdminAnalytics = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [toolStats, setToolStats] = useState<ToolStat[]>([]);
  const [catStats, setCatStats] = useState<CategoryStat[]>([]);
  const [totalRuns, setTotalRuns] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) navigate("/login");
      else if (!isAdmin) navigate("/dashboard");
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchData = async () => {
      const { data: usage } = await supabase.from("tool_usage").select("tool_name, category");

      if (usage) {
        setTotalRuns(usage.length);

        const toolMap = new Map<string, number>();
        const catMap = new Map<string, number>();
        usage.forEach((u) => {
          toolMap.set(u.tool_name, (toolMap.get(u.tool_name) || 0) + 1);
          catMap.set(u.category, (catMap.get(u.category) || 0) + 1);
        });

        setToolStats(
          Array.from(toolMap, ([tool_name, count]) => ({ tool_name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 20)
        );
        setCatStats(
          Array.from(catMap, ([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count)
        );
      }
      setLoading(false);
    };
    fetchData();
  }, [isAdmin]);

  if (authLoading || adminLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="font-heading text-sm text-primary animate-pulse-neon">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="cyber-grid min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Link to="/admin" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-3 w-3" /> Back to Admin
        </Link>
        <h1 className="mt-4 font-heading text-2xl font-bold text-secondary neon-text-magenta flex items-center gap-2">
          <BarChart3 className="h-6 w-6" /> Tool Analytics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{totalRuns} total tool runs across all users</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Top Tools */}
          <div className="rounded border border-primary/10 bg-card p-5 border-glow">
            <h2 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Top Tools
            </h2>
            {toolStats.length === 0 ? (
              <p className="mt-4 text-xs text-muted-foreground">No usage data yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {toolStats.map((item) => {
                  const max = toolStats[0]?.count || 1;
                  return (
                    <div key={item.tool_name}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-foreground">{item.tool_name}</span>
                        <span className="text-muted-foreground">{item.count} runs</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${(item.count / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* By Category */}
          <div className="rounded border border-primary/10 bg-card p-5 border-glow">
            <h2 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-secondary" /> By Category
            </h2>
            {catStats.length === 0 ? (
              <p className="mt-4 text-xs text-muted-foreground">No usage data yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {catStats.map((item) => {
                  const max = catStats[0]?.count || 1;
                  return (
                    <div key={item.category}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-foreground capitalize">{item.category}</span>
                        <span className="text-muted-foreground">{item.count} runs</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-secondary" style={{ width: `${(item.count / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
