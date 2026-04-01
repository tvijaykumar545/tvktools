import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Shield, User, Crown, Coins, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAdminAdjustPoints } from "@/hooks/usePoints";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  plan: string;
  points_balance: number;
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
  const adjustPoints = useAdminAdjustPoints();

  // Points dialog state
  const [pointsDialogOpen, setPointsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [pointsAmount, setPointsAmount] = useState(0);
  const [pointsAction, setPointsAction] = useState<"add" | "deduct">("add");
  const [pointsDescription, setPointsDescription] = useState("");

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

      setUsers((profiles as any) || []);
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

  const openPointsDialog = (u: UserProfile, action: "add" | "deduct") => {
    setSelectedUser(u);
    setPointsAction(action);
    setPointsAmount(0);
    setPointsDescription("");
    setPointsDialogOpen(true);
  };

  const handleAdjustPoints = async () => {
    if (!selectedUser || pointsAmount <= 0) return;
    try {
      const result = await adjustPoints.mutateAsync({
        targetUserId: selectedUser.user_id,
        points: pointsAmount,
        action: pointsAction,
        description: pointsDescription,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === selectedUser.user_id
            ? { ...u, points_balance: result.balance }
            : u
        )
      );
      toast({ title: `${pointsAction === "add" ? "Added" : "Deducted"} ${pointsAmount} points` });
      setPointsDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
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
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>Joined {new Date(u.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1">
                      <Coins className="h-3 w-3 text-primary" />
                      <span className="font-heading font-bold text-foreground">{u.points_balance ?? 0}</span> pts
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => openPointsDialog(u, "add")}
                  className="flex items-center gap-1 rounded border border-primary/30 px-2 py-1 font-heading text-[10px] font-bold text-primary hover:bg-primary/10 transition-all"
                  title="Add points"
                >
                  <Plus className="h-3 w-3" /> Points
                </button>
                <button
                  onClick={() => openPointsDialog(u, "deduct")}
                  className="flex items-center gap-1 rounded border border-destructive/30 px-2 py-1 font-heading text-[10px] font-bold text-destructive hover:bg-destructive/10 transition-all"
                  title="Deduct points"
                >
                  <Minus className="h-3 w-3" /> Points
                </button>
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

      {/* Points Adjustment Dialog */}
      <Dialog open={pointsDialogOpen} onOpenChange={setPointsDialogOpen}>
        <DialogContent className="max-w-sm border-primary/20 bg-card">
          <DialogHeader>
            <DialogTitle className="font-heading text-primary flex items-center gap-2">
              <Coins className="h-5 w-5" />
              {pointsAction === "add" ? "Add Points" : "Deduct Points"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                User: <strong className="text-foreground">{selectedUser?.display_name || "Unnamed"}</strong>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Current balance: <strong className="text-foreground">{selectedUser?.points_balance ?? 0}</strong> points
              </p>
            </div>
            <div>
              <label className="font-heading text-[10px] uppercase text-muted-foreground">Points</label>
              <input
                type="number"
                min={1}
                value={pointsAmount || ""}
                onChange={(e) => setPointsAmount(parseInt(e.target.value) || 0)}
                placeholder="Enter amount"
                className="mt-1 h-9 w-full rounded border border-primary/20 bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="font-heading text-[10px] uppercase text-muted-foreground">Reason (optional)</label>
              <input
                value={pointsDescription}
                onChange={(e) => setPointsDescription(e.target.value)}
                placeholder="e.g. Monthly bonus"
                className="mt-1 h-9 w-full rounded border border-primary/20 bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPointsDialogOpen(false)}
                className="rounded border border-primary/20 px-4 py-2 font-heading text-xs text-muted-foreground hover:text-primary"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustPoints}
                disabled={pointsAmount <= 0 || adjustPoints.isPending}
                className={`rounded px-4 py-2 font-heading text-xs font-bold disabled:opacity-50 ${
                  pointsAction === "add"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                }`}
              >
                {adjustPoints.isPending
                  ? "Processing..."
                  : pointsAction === "add"
                  ? `Add ${pointsAmount} Points`
                  : `Deduct ${pointsAmount} Points`}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
