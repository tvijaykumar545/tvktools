import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { User, Key, History, Star, BarChart3, Heart, ChevronDown, Clock } from "lucide-react";
import { useToolUsageStats } from "@/hooks/useToolUsageStats";
import { useToolFavorites } from "@/hooks/useToolFavorites";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useToolFavorites } from "@/hooks/useToolFavorites";

const Dashboard = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const stats = useToolUsageStats();
  const { favorites, loading: favLoading } = useToolFavorites();
  const [showAllHistory, setShowAllHistory] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  if (loading || stats.loading || favLoading) {
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
    { label: "Favorites", value: favorites.length.toString(), icon: Heart },
    { label: "Categories", value: stats.categoryBreakdown.length.toString(), icon: Key },
  ];

  const displayedHistory = showAllHistory ? stats.recentTools : stats.recentTools.slice(0, 10);

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
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

        {/* Favorites */}
        <div className="mt-8 rounded border border-primary/10 bg-card p-5 border-glow">
          <h2 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
            <Heart className="h-4 w-4 text-destructive" />
            Favorite Tools
          </h2>
          {favorites.length === 0 ? (
            <p className="mt-4 text-xs text-muted-foreground">
              No favorites yet. Click the ❤️ button on any tool page to save it here.{" "}
              <Link to="/tools" className="text-primary hover:underline">Browse tools</Link>
            </p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((fav) => (
                <Link
                  key={fav.id}
                  to={`/tool/${fav.tool_id}`}
                  className="flex items-center gap-3 rounded border border-primary/10 bg-muted/30 p-3 transition-all hover:border-primary/40 hover:bg-primary/5"
                >
                  <Heart className="h-4 w-4 fill-destructive text-destructive shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">{fav.tool_name}</div>
                    <div className="text-[10px] text-muted-foreground capitalize">{fav.category}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
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

        {/* Usage by Time of Day */}
        <div className="mt-6 rounded border border-primary/10 bg-card p-5 border-glow">
          <h2 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Usage by Time of Day
          </h2>
          {stats.totalUses === 0 ? (
            <p className="mt-4 text-xs text-muted-foreground">No usage data yet.</p>
          ) : (
            <div className="mt-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.hourlyBreakdown}>
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    interval={2}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--primary) / 0.2)",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value: number) => [`${value} runs`, "Usage"]}
                  />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                    {stats.hourlyBreakdown.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.count > 0 ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Full Usage History */}
        <div className="mt-6 rounded border border-primary/10 bg-card p-5 border-glow">
          <h2 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            Usage History
            {stats.recentTools.length > 0 && (
              <span className="ml-auto text-[10px] text-muted-foreground font-normal">
                {stats.recentTools.length} total runs
              </span>
            )}
          </h2>
          {stats.recentTools.length === 0 ? (
            <p className="mt-4 text-xs text-muted-foreground">No recent activity.</p>
          ) : (
            <>
              <div className="mt-4 space-y-2">
                {displayedHistory.map((item, i) => (
                  <Link
                    key={`${item.created_at}-${i}`}
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
              {stats.recentTools.length > 10 && (
                <button
                  onClick={() => setShowAllHistory(!showAllHistory)}
                  className="mt-3 flex items-center gap-1 text-xs text-primary hover:underline mx-auto"
                >
                  <ChevronDown className={`h-3 w-3 transition-transform ${showAllHistory ? "rotate-180" : ""}`} />
                  {showAllHistory ? "Show less" : `Show all ${stats.recentTools.length} entries`}
                </button>
              )}
            </>
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
              { label: "Settings", to: "/settings", icon: "⚙️" },
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
