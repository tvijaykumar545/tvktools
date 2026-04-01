import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePointsBalance } from "@/hooks/usePoints";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Zap, Sparkles, Crown, BatteryCharging, Check, Upload, Coins, Loader2 } from "lucide-react";
import SEOHead from "@/components/SEOHead";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const packages = [
  { name: "Starter", points: 100, price: 99, icon: Zap },
  { name: "Basic", points: 300, price: 249, icon: Sparkles },
  { name: "Standard", points: 700, price: 499, icon: Sparkles, popular: true },
  { name: "Pro", points: 1500, price: 899, icon: Crown },
  { name: "Power", points: 5000, price: 2499, icon: BatteryCharging },
];

const BuyPoints = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: pointsBalance = 0 } = usePointsBalance();
  const [processingPkg, setProcessingPkg] = useState<string | null>(null);
  const [manualPkg, setManualPkg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  // Load Razorpay script
  useEffect(() => {
    if (document.getElementById("razorpay-script")) {
      setRazorpayLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
  }, []);

  const handleRazorpayPay = async (pkg: typeof packages[0]) => {
    if (!user) return;
    setProcessingPkg(pkg.name);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
        body: { package_name: pkg.name, points_amount: pkg.points, price_inr: pkg.price },
      });

      if (error || !data?.order_id) throw new Error(data?.error || "Failed to create order");

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "TVK Tools",
        description: `${pkg.name} — ${pkg.points} Points`,
        order_id: data.order_id,
        handler: async (response: any) => {
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-razorpay-payment", {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                package_name: pkg.name,
                points_amount: pkg.points,
                price_inr: pkg.price,
              },
            });
            if (verifyError || !verifyData?.success) throw new Error(verifyData?.error || "Verification failed");
            toast.success(`${pkg.points} points credited successfully!`);
            queryClient.invalidateQueries({ queryKey: ["points-balance"] });
            queryClient.invalidateQueries({ queryKey: ["points-transactions"] });
          } catch (e: any) {
            toast.error(e.message || "Payment verification failed");
          }
        },
        prefill: { email: user.email },
        theme: { color: "#6366f1" },
        modal: { ondismiss: () => setProcessingPkg(null) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp: any) => {
        toast.error(resp.error?.description || "Payment failed");
        setProcessingPkg(null);
      });
      rzp.open();
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setProcessingPkg(null);
    }
  };

  const handleManualSubmit = async (pkg: typeof packages[0]) => {
    if (!user || !fileRef.current?.files?.[0]) {
      toast.error("Please upload a screenshot");
      return;
    }
    setUploading(true);
    try {
      const file = fileRef.current.files[0];
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("payment-screenshots")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { error } = await supabase.rpc("submit_purchase_request", {
        p_user_id: user.id,
        p_package_name: pkg.name,
        p_points_amount: pkg.points,
        p_price_inr: pkg.price,
        p_screenshot_url: filePath,
        p_user_email: user.email || "",
      });
      if (error) throw error;

      toast.success("Purchase request submitted! Points will be credited after admin review.");
      setManualPkg(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e: any) {
      toast.error(e.message || "Failed to submit");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return null;
  if (!user) return null;

  return (
    <>
      <SEOHead title="Buy Points — TVK Tools" description="Purchase points to unlock premium tools" />
      <div className="cyber-grid min-h-screen py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <h1 className="font-heading text-3xl font-bold text-primary neon-text md:text-4xl">Buy Points</h1>
            <p className="mt-2 text-sm text-muted-foreground">Pay securely via Razorpay or submit a manual payment</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2">
              <Coins className="h-4 w-4 text-primary" />
              <span className="text-sm font-heading font-bold text-foreground">{pointsBalance} points</span>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {packages.map((pkg) => {
              const Icon = pkg.icon;
              const isProcessing = processingPkg === pkg.name;
              return (
                <div
                  key={pkg.name}
                  className={`relative flex flex-col rounded border bg-card p-5 transition-all ${
                    pkg.popular ? "border-secondary/50 neon-glow-magenta scale-105" : "border-primary/20 border-glow"
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded bg-secondary px-3 py-0.5 font-heading text-[10px] font-bold text-secondary-foreground">
                      BEST VALUE
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <h3 className="font-heading text-lg font-bold text-foreground">{pkg.name}</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading text-3xl font-black text-primary">₹{pkg.price}</span>
                  </div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{pkg.points.toLocaleString()} points</div>

                  <div className="mt-auto pt-4 space-y-2">
                    <button
                      onClick={() => handleRazorpayPay(pkg)}
                      disabled={isProcessing || !razorpayLoaded}
                      className={`w-full rounded py-2.5 text-center font-heading text-xs font-bold transition-all ${
                        pkg.popular
                          ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      } disabled:opacity-50`}
                    >
                      {isProcessing ? (
                        <span className="flex items-center justify-center gap-2"><Loader2 className="h-3 w-3 animate-spin" />Processing…</span>
                      ) : (
                        "Pay with Razorpay"
                      )}
                    </button>
                    <button
                      onClick={() => setManualPkg(manualPkg === pkg.name ? null : pkg.name)}
                      className="w-full rounded border border-primary/30 py-2 text-center font-heading text-[11px] text-primary hover:bg-primary/10 transition-all"
                    >
                      Manual Payment
                    </button>
                  </div>

                  {manualPkg === pkg.name && (
                    <div className="mt-3 space-y-2 border-t border-primary/10 pt-3">
                      <p className="text-[11px] text-muted-foreground">Pay ₹{pkg.price} via UPI and upload screenshot</p>
                      <input ref={fileRef} type="file" accept="image/*" className="w-full text-xs file:bg-primary/10 file:border-0 file:rounded file:px-2 file:py-1 file:text-xs file:text-primary" />
                      <button
                        onClick={() => handleManualSubmit(pkg)}
                        disabled={uploading}
                        className="w-full flex items-center justify-center gap-1.5 rounded bg-accent/20 py-2 font-heading text-[11px] text-accent-foreground hover:bg-accent/30 transition-all disabled:opacity-50"
                      >
                        {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                        {uploading ? "Submitting…" : "Submit for Review"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default BuyPoints;
