import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Shield, User, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  plan: string;
  created_at: string;
}

const AdminUsers = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) navigate("/login");
      else if (!isAdmin) navigate("/dashboard");
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetch = async () => {
      const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      const { data: allRoles } = await supabase.from("user_roles").select("*");

      const roleMap: Record<string, string[]> = {};
      allRoles?.forEach((r) => {
        if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
        roleMap[r.user_id].push(r.role);
      });

      setUsers(profiles || []);
      setRoles(roleMap);
      setLoading(false);
    };
    fetch();
  }, [isAdmin]);

  const updatePlan = async (userId: string, plan: string) => {
    const { error } = await supabase.from("profiles").update({ plan }).eq("user_id", userId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setUsers((prev) => prev.map((u) => (u.user_id === userId ? { ...u, plan } : u)));
      toast({ title: "Plan updated" });
    }
  };

  const toggleAdminRole = async (userId: string) => {
    const hasAdmin = roles[userId]?.includes("admin");
    if (hasAdmin) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
      if (!error) {
        setRoles((prev) => ({ ...prev, [userId]: (prev[userId] || []).filter((r) => r !== "admin") }));
        toast({ title: "Admin role removed" });
      }
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" as any });
      if (!error) {
        setRoles((prev) => ({ ...prev, [userId]: [...(prev[userId] || []), "admin"] }));
        toast({ title: "Admin role granted" });
      }
    }
  };

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
          <Shield className="h-6 w-6" /> User Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{users.length} registered users</p>

        <div className="mt-6 space-y-3">
          {users.map((u) => (
            <div key={u.id} className="flex flex-col gap-3 rounded border border-primary/10 bg-card p-4 sm:flex-row sm:items-center sm:justify-between border-glow">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-muted">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-sm font-bold text-foreground">{u.display_name || "Unnamed"}</span>
                    {roles[u.user_id]?.includes("admin") && (
                      <Crown className="h-3.5 w-3.5 text-accent" />
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Joined {new Date(u.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={u.plan}
                  onChange={(e) => updatePlan(u.user_id, e.target.value)}
                  className="rounded border border-primary/20 bg-muted px-2 py-1 font-heading text-[10px] text-foreground outline-none"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
                <button
                  onClick={() => toggleAdminRole(u.user_id)}
                  className={`rounded px-3 py-1 font-heading text-[10px] font-bold transition-all ${
                    roles[u.user_id]?.includes("admin")
                      ? "border border-destructive/30 text-destructive hover:bg-destructive/10"
                      : "border border-accent/30 text-accent hover:bg-accent/10"
                  }`}
                >
                  {roles[u.user_id]?.includes("admin") ? "Remove Admin" : "Make Admin"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
