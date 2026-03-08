import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center cyber-grid px-4">
        <div className="w-full max-w-md rounded border border-primary/20 bg-card p-8 neon-glow text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 font-heading text-2xl font-bold text-primary neon-text">Check Your Email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We've sent a password reset link to <span className="text-foreground">{email}</span>. Click the link in the email to set a new password.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center cyber-grid px-4">
      <div className="w-full max-w-md rounded border border-primary/20 bg-card p-8 neon-glow">
        <div className="text-center">
          <Mail className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-3 font-heading text-2xl font-bold text-primary neon-text">Forgot Password</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter your email and we'll send you a reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <div className="rounded border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
              {error}
            </div>
          )}
          <div>
            <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="mt-1 h-10 w-full rounded border border-primary/20 bg-muted px-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-primary py-3 font-heading text-xs font-bold text-primary-foreground neon-glow disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          Remember your password?{" "}
          <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
