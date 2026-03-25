import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Check, X, Clock, Image, ArrowLeft, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const AdminPurchases = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [filter, setFilter] = useState<"pending" | "all">("pending");

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) navigate("/login");
      else if (!isAdmin) navigate("/dashboard");
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ["admin-purchases", filter],
    queryFn: async () => {
      let query = supabase
        .from("points_purchases")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (filter === "pending") {
        query = query.eq("status", "pending");
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  // Realtime subscription for new purchases
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel("admin-purchases-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "points_purchases" }, () => {
        qc.invalidateQueries({ queryKey: ["admin-purchases"] });
        toast.info("New purchase request received!");
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin, qc]);

  const approveMutation = useMutation({
    mutationFn: async (purchaseId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.rpc("admin_approve_purchase" as any, {
        p_admin_id: user.id,
        p_purchase_id: purchaseId,
      });
      if (error) throw error;
      const result = data as any;
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-purchases"] });
      toast.success("Purchase approved! Points credited to user.");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ purchaseId, reason }: { purchaseId: string; reason: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.rpc("admin_reject_purchase" as any, {
        p_admin_id: user.id,
        p_purchase_id: purchaseId,
        p_reason: reason || "Payment could not be verified",
      });
      if (error) throw error;
      const result = data as any;
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-purchases"] });
      setRejectId(null);
      setRejectReason("");
      toast.success("Purchase rejected.");
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (authLoading || adminLoading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="font-heading text-sm text-primary animate-pulse-neon">Loading...</div></div>;
  }
  if (!isAdmin) return null;

  const pendingCount = purchases.filter((p: any) => p.status === "pending").length;

  return (
    <div className="cyber-grid min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <button onClick={() => navigate("/admin")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-6 w-6 text-secondary" />
          <h1 className="font-heading text-2xl font-bold text-secondary neon-text-magenta">Purchase Approvals</h1>
          {pendingCount > 0 && (
            <span className="rounded-full bg-yellow-500 px-2.5 py-0.5 text-[10px] font-bold text-black">{pendingCount} pending</span>
          )}
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter("pending")}
            className={`rounded px-3 py-1.5 text-xs font-heading font-semibold transition-all ${filter === "pending" ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Clock className="inline h-3 w-3 mr-1" /> Pending
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`rounded px-3 py-1.5 text-xs font-heading font-semibold transition-all ${filter === "all" ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground"}`}
          >
            All Purchases
          </button>
        </div>

        {isLoading ? (
          <div className="text-sm text-muted-foreground animate-pulse">Loading purchases...</div>
        ) : purchases.length === 0 ? (
          <div className="rounded border border-primary/10 bg-card p-8 text-center text-sm text-muted-foreground">
            {filter === "pending" ? "No pending purchase requests 🎉" : "No purchases found."}
          </div>
        ) : (
          <div className="space-y-3">
            {purchases.map((p: any) => (
              <div key={p.id} className={`rounded-lg border bg-card p-4 transition-all ${p.status === "pending" ? "border-yellow-500/30" : "border-primary/10"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading text-sm font-bold text-foreground">{p.package_name}</span>
                      <span className="text-xs text-muted-foreground">{p.points_amount} pts — ₹{p.price_inr}</span>
                      {p.status === "pending" && <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-semibold text-yellow-500">Pending</span>}
                      {p.status === "approved" && <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-500">Approved</span>}
                      {p.status === "rejected" && <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">Rejected</span>}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      User: {p.user_email || p.user_id?.slice(0, 8)} · {new Date(p.created_at).toLocaleString()}
                    </div>
                    {p.rejection_reason && p.status === "rejected" && (
                      <div className="mt-1 text-xs text-destructive">Reason: {p.rejection_reason}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {p.screenshot_url && (
                      <a href={p.screenshot_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded border border-primary/20 px-2 py-1 text-[10px] text-primary hover:bg-primary/10 transition-all">
                        <Image className="h-3 w-3" /> Screenshot <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}

                    {p.status === "pending" && (
                      <>
                        <button
                          onClick={() => approveMutation.mutate(p.id)}
                          disabled={approveMutation.isPending}
                          className="flex items-center gap-1 rounded bg-green-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-green-700 transition-all disabled:opacity-50"
                        >
                          <Check className="h-3 w-3" /> Approve
                        </button>
                        <button
                          onClick={() => setRejectId(p.id)}
                          className="flex items-center gap-1 rounded bg-destructive px-3 py-1.5 text-[10px] font-bold text-destructive-foreground hover:bg-destructive/90 transition-all"
                        >
                          <X className="h-3 w-3" /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Reject reason modal inline */}
                {rejectId === p.id && (
                  <div className="mt-3 flex items-center gap-2 border-t border-primary/10 pt-3">
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Reason for rejection..."
                      className="flex-1 rounded border border-primary/20 bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                    />
                    <button
                      onClick={() => rejectMutation.mutate({ purchaseId: p.id, reason: rejectReason })}
                      disabled={rejectMutation.isPending}
                      className="rounded bg-destructive px-3 py-1.5 text-[10px] font-bold text-destructive-foreground disabled:opacity-50"
                    >
                      Confirm Reject
                    </button>
                    <button onClick={() => { setRejectId(null); setRejectReason(""); }} className="text-xs text-muted-foreground hover:text-foreground">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPurchases;
