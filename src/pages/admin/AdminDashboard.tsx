import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Users, BarChart3, Wrench, Shield, FileText } from "lucide-react";

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, toolRuns: 0, categories: 0 });

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) navigate("/login");
      else if (!isAdmin) navigate("/dashboard");
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchStats = async () => {
      const [profilesRes, usageRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("tool_usage").select("id", { count: "exact", head: true }),
      ]);
      const { data: cats } = await supabase.from("tool_usage").select("category");
      const uniqueCats = new Set(cats?.map((c) => c.category) || []);
      setStats({
        users: profilesRes.count || 0,
        toolRuns: usageRes.count || 0,
        categories: uniqueCats.size,
      });
    };
    fetchStats();
  }, [isAdmin]);

  if (authLoading || adminLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="font-heading text-sm text-primary animate-pulse-neon">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const cards = [
    { label: "Total Users", value: stats.users, icon: Users, to: "/admin/users" },
    { label: "Total Tool Runs", value: stats.toolRuns, icon: BarChart3, to: "/admin/analytics" },
    { label: "Categories Active", value: stats.categories, icon: Wrench, to: "/admin/analytics" },
  ];

  return (
    <div className="cyber-grid min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-secondary" />
          <h1 className="font-heading text-2xl font-bold text-secondary neon-text-magenta">Admin Panel</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Manage users, content, and analytics</p>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.label}
              to={card.to}
              className="rounded border border-secondary/20 bg-card p-5 transition-all hover:border-secondary/50 neon-glow-magenta"
            >
              <div className="flex items-center gap-3">
                <card.icon className="h-5 w-5 text-secondary" />
                <div>
                  <div className="font-heading text-2xl font-bold text-foreground">{card.value}</div>
                  <div className="text-xs text-muted-foreground">{card.label}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick links */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Link to="/admin/users" className="flex items-center gap-3 rounded border border-primary/10 bg-card p-4 transition-all hover:border-primary/40 border-glow">
            <Users className="h-5 w-5 text-primary" />
            <span className="font-heading text-xs font-semibold text-foreground">User Management</span>
          </Link>
          <Link to="/admin/analytics" className="flex items-center gap-3 rounded border border-primary/10 bg-card p-4 transition-all hover:border-primary/40 border-glow">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="font-heading text-xs font-semibold text-foreground">Tool Analytics</span>
          </Link>
          <Link to="/dashboard" className="flex items-center gap-3 rounded border border-primary/10 bg-card p-4 transition-all hover:border-primary/40 border-glow">
            <Wrench className="h-5 w-5 text-primary" />
            <span className="font-heading text-xs font-semibold text-foreground">Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
