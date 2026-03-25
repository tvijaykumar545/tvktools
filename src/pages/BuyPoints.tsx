import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePointsBalance } from "@/hooks/usePoints";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Coins, Check, QrCode, ArrowLeft, Sparkles, Zap, Crown } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";
import upiQrImage from "@/assets/upi-qr.png";
import SEOHead from "@/components/SEOHead";

const PACKAGES = [
  {
    id: "starter",
    name: "Starter Pack",
    points: 100,
    price: 99,
    icon: Zap,
    popular: false,
    description: "Entry level — great for trying out premium tools",
  },
  {
    id: "basic",
    name: "Basic Pack",
    points: 300,
    price: 249,
    icon: Sparkles,
    popular: false,
    description: "Small discount for casual users",
  },
  {
    id: "standard",
    name: "Standard Pack",
    points: 700,
    price: 499,
    icon: Sparkles,
    popular: true,
    description: "Most popular — best value for regular users",
  },
  {
    id: "pro",
    name: "Pro Pack",
    points: 1500,
    price: 899,
    icon: Crown,
    popular: false,
    description: "Best value for power users",
  },
  {
    id: "power",
    name: "Power Pack",
    points: 5000,
    price: 2499,
    icon: Crown,
    popular: false,
    description: "Maximum points for bulk users",
  },
];

const UPI_ID = "tirupathi.vijaykumar@ybl";
const MERCHANT_NAME = "TVK Tools";

const BuyPoints = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: balance = 0 } = usePointsBalance();
  const qc = useQueryClient();

  const [selectedPkg, setSelectedPkg] = useState<typeof PACKAGES[0] | null>(null);
  
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);


  const creditMutation = useMutation({
    mutationFn: async (pkg: typeof PACKAGES[0]) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.rpc("credit_points_purchase" as any, {
        p_user_id: user.id,
        p_package_name: pkg.name,
        p_points_amount: pkg.points,
        p_price_inr: pkg.price,
      });
      if (error) throw error;
      const result = data as any;
      if (!result.success) throw new Error(result.error || "Failed to credit points");
      return result;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["points-balance"] });
      qc.invalidateQueries({ queryKey: ["points-transactions"] });
      setConfirmed(true);
      toast.success(`${selectedPkg?.points} points credited! New balance: ${data.balance}`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to process purchase");
    },
  });

  const handleConfirmPayment = () => {
    if (!selectedPkg) return;
    creditMutation.mutate(selectedPkg);
  };

  const handleReset = () => {
    setSelectedPkg(null);
    setConfirmed(false);
  };

  if (loading || !user) return null;

  return (
    <>
      <SEOHead title="Buy Points | TVK Tools" description="Purchase points to use premium tools" />
      <div className="cyber-grid min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-4"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </button>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Buy Points
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Current balance: <span className="font-bold text-primary">{balance} points</span>
            </p>
          </div>

          {confirmed ? (
            /* Success State */
            <div className="flex flex-col items-center justify-center rounded-xl border border-primary/30 bg-card p-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-heading text-xl font-bold text-foreground">Payment Confirmed!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-bold text-primary">{selectedPkg?.points} points</span> have been added to your account.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleReset}
                  className="rounded border border-primary/30 px-4 py-2 font-heading text-xs text-primary hover:bg-primary/10 transition-all"
                >
                  Buy More
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="rounded bg-primary px-4 py-2 font-heading text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          ) : !selectedPkg ? (
            /* Package Selection */
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {PACKAGES.map((pkg) => {
                const Icon = pkg.icon;
                return (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPkg(pkg)}
                    className={`relative flex flex-col items-center rounded-xl border p-6 text-center transition-all hover:scale-[1.02] hover:shadow-lg ${
                      pkg.popular
                        ? "border-primary/50 bg-primary/5 shadow-md shadow-primary/10"
                        : "border-primary/20 bg-card hover:border-primary/40"
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2.5 rounded-full bg-primary px-3 py-0.5 font-heading text-[10px] font-bold text-primary-foreground uppercase">
                        Most Popular
                      </span>
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
                    <div className="mt-4 w-full rounded bg-primary/10 py-2 font-heading text-xs font-semibold text-primary">
                      Select Package
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* QR Payment Step */
            <div className="flex flex-col items-center rounded-xl border border-primary/20 bg-card p-8">
              <h2 className="font-heading text-lg font-bold text-foreground mb-1">
                Pay ₹{selectedPkg.price} for {selectedPkg.points} points
              </h2>
              <p className="text-xs text-muted-foreground mb-6">
                Scan the QR code below with any UPI app to complete payment
              </p>

              <div className="rounded-xl border border-primary/10 bg-white p-4 shadow-lg">
                <img src={upiQrImage} alt="UPI Payment QR Code" className="h-[250px] w-[250px] object-contain" />
              </div>

              <p className="mt-4 text-[11px] text-muted-foreground">
                UPI ID: <span className="font-mono font-semibold text-foreground">{UPI_ID}</span>
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Supported: Google Pay, PhonePe, Paytm, BHIM & more
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleReset}
                  className="rounded border border-primary/20 px-4 py-2.5 font-heading text-xs text-muted-foreground hover:text-foreground transition-all"
                >
                  ← Change Package
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={creditMutation.isPending}
                  className="flex items-center gap-2 rounded bg-primary px-6 py-2.5 font-heading text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all neon-glow disabled:opacity-50"
                >
                  <Coins className="h-4 w-4" />
                  {creditMutation.isPending ? "Processing..." : "I've Paid — Credit Points"}
                </button>
              </div>

              <p className="mt-4 text-[10px] text-destructive/70">
                ⚠ Please only click "I've Paid" after completing the payment
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BuyPoints;
