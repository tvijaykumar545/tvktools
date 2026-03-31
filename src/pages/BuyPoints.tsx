import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePointsBalance } from "@/hooks/usePoints";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Coins, ArrowLeft, Sparkles, Zap, Crown, Clock, CheckCircle2, XCircle, CreditCard } from "lucide-react";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";

const PACKAGES = [
  { id: "starter", name: "Starter Pack", points: 100, price: 99, icon: Zap, popular: false, description: "Entry level — great for trying out premium tools" },
  { id: "basic", name: "Basic Pack", points: 300, price: 249, icon: Sparkles, popular: false, description: "Small discount for casual users" },
  { id: "standard", name: "Standard Pack", points: 700, price: 499, icon: Sparkles, popular: true, description: "Most popular — best value for regular users" },
  { id: "pro", name: "Pro Pack", points: 1500, price: 899, icon: Crown, popular: false, description: "Best value for power users" },
  { id: "power", name: "Power Pack", points: 5000, price: 2499, icon: Crown, popular: false, description: "Maximum points for bulk users" },
];

const BuyPoints = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: balance = 0 } = usePointsBalance();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  const { data: purchaseHistory = [] } = useQuery({
    queryKey: ["my-purchases", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("points_purchases")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const handleCheckout = async (pkg: typeof PACKAGES[0]) => {
    setCheckoutLoading(pkg.id);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { packageId: pkg.id },
      });
      if (error) throw new Error(error.message);
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to start checkout");
    } finally {
      setCheckoutLoading(null);
    }
  };

  if (loading || !user) return null;

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-semibold text-yellow-500"><Clock className="h-3 w-3" /> Pending</span>;
      case "approved":
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500"><CheckCircle2 className="h-3 w-3" /> Approved</span>;
      case "rejected":
        return <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive"><XCircle className="h-3 w-3" /> Rejected</span>;
      default:
        return <span className="text-[10px] text-muted-foreground">{status}</span>;
    }
  };

  return (
    <>
      <SEOHead title="Buy Points | TVK Tools" description="Purchase points to use premium tools" />
      <div className="cyber-grid min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-8">
            <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-4">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </button>
            <h1 className="font-heading text-2xl font-bold text-foreground">Buy Points</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Current balance: <span className="font-bold text-primary">{balance} points</span>
            </p>
          </div>

          {/* Package Selection */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {PACKAGES.map((pkg) => {
              const Icon = pkg.icon;
              const isLoading = checkoutLoading === pkg.id;
              return (
                <div
                  key={pkg.id}
                  className={`relative flex flex-col items-center rounded-xl border p-6 text-center transition-all ${
                    pkg.popular ? "border-primary/50 bg-primary/5 shadow-md shadow-primary/10" : "border-primary/20 bg-card"
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2.5 rounded-full bg-primary px-3 py-0.5 font-heading text-[10px] font-bold text-primary-foreground uppercase">Most Popular</span>
                  )}
                  <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${pkg.popular ? "bg-primary/20" : "bg-muted"}`}>
                    <Icon className={`h-6 w-6 ${pkg.popular ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <h3 className="font-heading text-base font-bold text-foreground">{pkg.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{pkg.description}</p>
                  <div className="mt-4">
                    <span className="font-heading text-3xl font-bold text-foreground">{pkg.points}</span>
                    <span className="ml-1 text-xs text-muted-foreground">points</span>
                  </div>
                  <div className="mt-1">
                    <span className="font-heading text-lg font-bold text-primary">₹{pkg.price}</span>
                  </div>
                  <button
                    onClick={() => handleCheckout(pkg)}
                    disabled={!!checkoutLoading}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-primary/10 py-2 font-heading text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-50"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    {isLoading ? "Redirecting..." : "Pay with Stripe"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Purchase History */}
          {purchaseHistory.length > 0 && (
            <div className="mt-10">
              <h2 className="font-heading text-lg font-bold text-foreground mb-4">Your Purchase History</h2>
              <div className="space-y-2">
                {purchaseHistory.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between rounded border border-primary/10 bg-card px-4 py-3">
                    <div>
                      <span className="text-sm font-semibold text-foreground">{p.package_name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{p.points_amount} pts — ₹{p.price_inr}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {statusBadge(p.status)}
                      {p.status === "rejected" && p.rejection_reason && (
                        <span className="text-[10px] text-destructive">{p.rejection_reason}</span>
                      )}
                      <span className="text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BuyPoints;
