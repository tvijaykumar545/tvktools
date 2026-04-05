import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { toast } from "sonner";

const Signup = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [referralCode, setReferralCode] = useState(searchParams.get("ref") || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data: signupData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          display_name: displayName,
          referral_code: referralCode.trim() || undefined,
        },
      },
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      // Claim referral bonus if code provided
      if (referralCode.trim() && signupData.user?.id) {
        try {
          await supabase.rpc("claim_referral_bonus" as any, {
            p_referral_code: referralCode.trim(),
            p_referred_user_id: signupData.user.id,
          });
        } catch {
          // Silently fail - referral is optional
        }
      }
      // Send welcome email
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "welcome",
          recipientEmail: email,
          idempotencyKey: `welcome-${email}`,
          templateData: { name: displayName || undefined },
        },
      });
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center cyber-grid px-4">
        <div className="w-full max-w-md rounded border border-primary/20 bg-card p-8 neon-glow text-center">
          <div className="text-4xl">📧</div>
          <h1 className="mt-4 font-heading text-xl font-bold text-primary neon-text">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We've sent a confirmation link to <span className="text-primary">{email}</span>
          </p>
          <Link to="/login" className="mt-6 inline-block text-xs text-primary hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center cyber-grid px-4">
      <div className="w-full max-w-md rounded border border-primary/20 bg-card p-8 neon-glow">
        <div className="text-center">
          <Link to="/" className="inline-block font-heading text-3xl font-extrabold tracking-tight text-primary neon-text hover:opacity-80 transition-opacity">
            TVK Tools
          </Link>
          <h1 className="mt-3 font-heading text-2xl font-bold text-primary neon-text">Create Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Join TVK Tools for free</p>
        </div>

        <form onSubmit={handleSignup} className="mt-8 space-y-4">
          {error && (
            <div className="rounded border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
              {error}
            </div>
          )}
          <div>
            <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="mt-1 h-10 w-full rounded border border-primary/20 bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 h-10 w-full rounded border border-primary/20 bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 h-10 w-full rounded border border-primary/20 bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Referral Code <span className="text-muted-foreground/50">(optional)</span>
            </label>
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="e.g. TVK-XXXX-XXXX"
              maxLength={20}
              className="mt-1 h-10 w-full rounded border border-primary/20 bg-muted px-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-primary py-3 font-heading text-xs font-bold text-primary-foreground neon-glow disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-primary/20" />
          <span className="text-[10px] text-muted-foreground font-heading">OR</span>
          <div className="h-px flex-1 bg-primary/20" />
        </div>

        <div className="mt-4">
          <GoogleSignInButton />
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
