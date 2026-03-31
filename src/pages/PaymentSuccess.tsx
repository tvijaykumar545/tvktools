import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const PaymentSuccess = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qc = useQueryClient();

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [pointsCredited, setPointsCredited] = useState(0);
  const [newBalance, setNewBalance] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }

    const sessionId = searchParams.get("session_id");
    if (!sessionId) { setStatus("error"); setErrorMsg("Missing payment session"); return; }

    const verify = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: { sessionId },
        });
        if (error) throw new Error(error.message);
        if (!data?.success) throw new Error(data?.error || "Verification failed");

        setPointsCredited(data.points_credited || 0);
        setNewBalance(data.balance || 0);
        setStatus("success");
        qc.invalidateQueries({ queryKey: ["points-balance"] });
        qc.invalidateQueries({ queryKey: ["points-transactions"] });
        qc.invalidateQueries({ queryKey: ["my-purchases"] });
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message || "Payment verification failed");
      }
    };

    verify();
  }, [user, authLoading, searchParams, navigate, qc]);

  if (authLoading) return null;

  return (
    <>
      <SEOHead title="Payment Status | TVK Tools" description="Payment verification" />
      <div className="cyber-grid min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="flex flex-col items-center rounded-xl border border-primary/20 bg-card p-12 text-center">
            {status === "verifying" && (
              <>
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <h2 className="font-heading text-xl font-bold text-foreground">Verifying Payment...</h2>
                <p className="mt-2 text-sm text-muted-foreground">Please wait while we confirm your payment and credit your points.</p>
              </>
            )}
            {status === "success" && (
              <>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="font-heading text-xl font-bold text-foreground">Payment Successful!</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-bold text-primary">{pointsCredited} points</span> have been credited to your account.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  New balance: <span className="font-bold text-foreground">{newBalance} points</span>
                </p>
                <div className="mt-6 flex gap-3">
                  <button onClick={() => navigate("/buy-points")} className="rounded border border-primary/30 px-4 py-2 font-heading text-xs text-primary hover:bg-primary/10 transition-all">
                    Buy More
                  </button>
                  <button onClick={() => navigate("/dashboard")} className="rounded bg-primary px-4 py-2 font-heading text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all">
                    Go to Dashboard
                  </button>
                </div>
              </>
            )}
            {status === "error" && (
              <>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/20">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="font-heading text-xl font-bold text-foreground">Verification Failed</h2>
                <p className="mt-2 text-sm text-muted-foreground">{errorMsg}</p>
                <div className="mt-6 flex gap-3">
                  <button onClick={() => navigate("/buy-points")} className="rounded border border-primary/30 px-4 py-2 font-heading text-xs text-primary hover:bg-primary/10 transition-all">
                    Try Again
                  </button>
                  <button onClick={() => navigate("/contact")} className="rounded bg-primary px-4 py-2 font-heading text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all">
                    Contact Support
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;
