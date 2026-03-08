import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { User, Settings, CreditCard, Key, History, Star } from "lucide-react";

const Dashboard = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="font-heading text-sm text-primary animate-pulse-neon">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const stats = [
    { label: "Tools Used", value: "0", icon: Star },
    { label: "API Calls", value: "0", icon: Key },
    { label: "Saved Results", value: "0", icon: History },
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

        {/* Plan Badge */}
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
          {stats.map((stat) => (
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

        {/* Upgrade CTA for free users */}
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
