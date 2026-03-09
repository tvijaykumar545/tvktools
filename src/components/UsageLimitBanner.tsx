import { Link } from "react-router-dom";
import { AlertTriangle, Zap, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface UsageLimitBannerProps {
  remaining: number;
  dailyLimit: number;
  isLimitReached: boolean;
  isGuest: boolean;
}

const UsageLimitBanner = ({ remaining, dailyLimit, isLimitReached, isGuest }: UsageLimitBannerProps) => {
  if (!isGuest) return null;

  const used = dailyLimit - remaining;
  const pct = (used / dailyLimit) * 100;

  if (isLimitReached) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 mb-6">
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <div className="flex-1">
            <h4 className="font-heading text-sm font-bold text-destructive">Daily Limit Reached</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              You've used all {dailyLimit} free tool uses for today. Sign up for a free account to get unlimited access.
            </p>
            <div className="mt-3 flex gap-2">
              <Link
                to="/signup"
                className="rounded bg-primary px-4 py-1.5 font-heading text-xs text-primary-foreground neon-glow transition-all hover:bg-primary/90"
              >
                Sign Up Free — Unlimited Access
              </Link>
              <Link
                to="/login"
                className="rounded border border-primary/30 px-4 py-1.5 font-heading text-xs text-primary hover:bg-primary/10 transition-all"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border p-3 mb-6 ${remaining <= 1 ? "border-yellow-500/40 bg-yellow-500/5" : "border-primary/20 bg-primary/5"}`}>
      <div className="flex items-center gap-3">
        {remaining <= 1 ? (
          <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
        ) : (
          <Zap className="h-4 w-4 text-primary shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-heading text-xs text-foreground">
              {remaining} of {dailyLimit} free uses remaining today
            </span>
            <Link to="/signup" className="text-[10px] text-primary hover:underline shrink-0 ml-2">
              Sign up for unlimited →
            </Link>
          </div>
          <Progress value={pct} className="h-1.5" />
        </div>
      </div>
    </div>
  );
};

export default UsageLimitBanner;
