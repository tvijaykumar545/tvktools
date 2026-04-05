import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNeedsVerification(false);
    setResent(false);
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else if (data.user && !data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      setNeedsVerification(true);
    } else {
      localStorage.setItem("tvk_remember_me", rememberMe ? "true" : "false");
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const handleResendVerification = async () => {
    setResending(true);
    setResent(false);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) {
      setError(error.message);
    } else {
      setResent(true);
    }
    setResending(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center cyber-grid px-4">
      <div className="w-full max-w-md rounded border border-primary/20 bg-card p-8 neon-glow">
        <div className="text-center">
          <Link to="/" className="inline-block font-heading text-3xl font-extrabold tracking-tight text-primary neon-text hover:opacity-80 transition-opacity">
            TVK Tools
          </Link>
          <h1 className="mt-3 font-heading text-2xl font-bold text-primary neon-text">Welcome Back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to TVK Tools</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          {needsVerification && (
            <div className="rounded border border-accent/30 bg-accent/10 p-3 text-xs text-accent-foreground space-y-2">
              <p>Please verify your email address before signing in. Check your inbox for the confirmation link.</p>
              {resent ? (
                <p className="text-primary font-semibold">✓ Verification email sent! Check your inbox.</p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="rounded bg-primary px-3 py-1.5 font-heading text-[10px] font-bold text-primary-foreground neon-glow disabled:opacity-50"
                >
                  {resending ? "Sending..." : "Resend Verification Email"}
                </button>
              )}
            </div>
          )}
          {error && (
            <div className="rounded border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
              {error}
            </div>
          )}
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
              className="mt-1 h-10 w-full rounded border border-primary/20 bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-primary/30 bg-muted accent-primary cursor-pointer"
            />
            <label htmlFor="rememberMe" className="text-xs text-muted-foreground cursor-pointer select-none">
              Remember me
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-primary py-3 font-heading text-xs font-bold text-primary-foreground neon-glow disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
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

        <div className="mt-6 flex flex-col items-center gap-2 text-xs text-muted-foreground">
          <Link to="/forgot-password" className="text-primary hover:underline">Forgot your password?</Link>
          <span>
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
