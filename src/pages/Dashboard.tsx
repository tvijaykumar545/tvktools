import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { User, Key, History, Star, BarChart3 } from "lucide-react";
import { useToolUsageStats } from "@/hooks/useToolUsageStats";

const Dashboard = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const stats = useToolUsageStats();

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  if (loading || stats.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="font-heading text-sm text-primary animate-pulse-neon">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const statCards = [
    { label: "Total Tool Runs", value: stats.totalUses.toString(), icon: Star },
    { label: "Tools Used", value: stats.toolBreakdown.length.toString(), icon: BarChart3 },
    { label: "Categories", value: stats.categoryBreakdown.length.toString(), icon: Key },
  ];

  return (
    <div className="cyber-grid min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-primary neon-text">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome back, {profile?.display_name || user.email}
            </p>
          </div>
          <button
            onClick={signOut}
            className="rounded border border-destructive/30 px-4 py-2 font-heading text-xs text-destructive hover:bg-destructive/10"
          >
            Sign Out
          </button>
        </div>

        {/* Profile Card */}
        <div className="mt-6 rounded border border-primary/20 bg-card p-6 gradient-cyber">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded border border-primary/30 bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-heading text-sm font-bold text-foreground">
                  {profile?.display_name || "User"}
                </div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
            </div>
            <div className="rounded bg-primary/10 px-3 py-1 font-heading text-xs font-bold uppercase text-primary neon-glow">
              {profile?.plan || "free"} plan
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {statCards.map((stat) => (
            <div key={stat.label} className="rounded border border-primary/10 bg-card p-5 border-glow">
              <div className="flex items-center gap-3">
                <stat.icon className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-heading text-xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Usage Breakdown */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Most Used Tools */}
          <div className="rounded border border-primary/10 bg-card p-5 border-glow">
            <h2 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Most Used Tools
            </h2>
            {stats.toolBreakdown.length === 0 ? (
              <p className="mt-4 text-xs text-muted-foreground">No tool usage yet. <Link to="/tools" className="text-primary hover:underline">Try a tool!</Link></p>
            ) : (
              <div className="mt-4 space-y-3">
                {stats.toolBreakdown.map((item) => {
                  const maxCount = stats.toolBreakdown[0]?.count || 1;
                  return (
                    <div key={item.tool_name}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-foreground">{item.tool_name}</span>
                        <span className="text-muted-foreground">{item.count} runs</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${(item.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="rounded border border-primary/10 bg-card p-5 border-glow">
            <h2 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              Usage by Category
            </h2>
            {stats.categoryBreakdown.length === 0 ? (
              <p className="mt-4 text-xs text-muted-foreground">No usage data yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {stats.categoryBreakdown.map((item) => {
                  const maxCount = stats.categoryBreakdown[0]?.count || 1;
                  return (
                    <div key={item.category}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-foreground capitalize">{item.category}</span>
                        <span className="text-muted-foreground">{item.count} runs</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-secondary transition-all"
                          style={{ width: `${(item.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 rounded border border-primary/10 bg-card p-5 border-glow">
          <h2 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            Recent Activity
          </h2>
          {stats.recentTools.length === 0 ? (
            <p className="mt-4 text-xs text-muted-foreground">No recent activity.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {stats.recentTools.map((item) => (
                <Link
                  key={item.created_at}
                  to={`/tool/${item.tool_id}`}
                  className="flex items-center justify-between rounded bg-muted/50 px-3 py-2 text-xs transition-all hover:bg-primary/10"
                >
                  <span className="text-foreground">{item.tool_name}</span>
                  <span className="text-muted-foreground">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="font-heading text-lg font-bold text-foreground">Quick Actions</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Browse Tools", to: "/tools", icon: "🔧" },
              { label: "View Pricing", to: "/pricing", icon: "💎" },
              { label: "API Access", to: "/api-access", icon: "🔑" },
              { label: "Settings", to: "/dashboard", icon: "⚙️" },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className="flex items-center gap-3 rounded border border-primary/10 bg-card p-4 transition-all hover:border-primary/40 hover:bg-surface-hover border-glow"
              >
                <span className="text-xl">{action.icon}</span>
                <span className="font-heading text-xs font-semibold text-foreground">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Upgrade CTA */}
        {profile?.plan === "free" && (
          <div className="mt-8 rounded border border-secondary/30 bg-card p-6 text-center neon-glow-magenta">
            <h3 className="font-heading text-lg font-bold text-secondary neon-text-magenta">
              Upgrade to Pro
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Unlock all 50+ tools, unlimited usage, and API access.
            </p>
            <Link
              to="/pricing"
              className="mt-4 inline-block rounded bg-secondary px-6 py-2 font-heading text-xs font-bold text-secondary-foreground"
            >
              View Plans
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
