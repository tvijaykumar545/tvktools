import { Coins, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

interface PointsBalanceBannerProps {
  balance: number;
  toolCost: number;
  isGuest: boolean;
}

const PointsBalanceBanner = ({ balance, toolCost, isGuest }: PointsBalanceBannerProps) => {
  if (isGuest) return null;

  const hasEnough = toolCost === 0 || balance >= toolCost;

  if (toolCost === 0) {
    return (
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 mb-6">
        <div className="flex items-center gap-3">
          <Coins className="h-4 w-4 text-primary shrink-0" />
          <div className="flex-1 flex items-center justify-between">
            <span className="text-xs text-foreground">
              <span className="font-heading font-bold">{balance}</span> points available
            </span>
            <span className="text-[10px] rounded bg-primary/10 px-2 py-0.5 font-heading text-primary uppercase">
              Free tool
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!hasEnough) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <div className="flex-1">
            <h4 className="font-heading text-sm font-bold text-destructive">Insufficient Points</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              This tool requires <strong className="text-foreground">{toolCost} points</strong> but you only have{" "}
              <strong className="text-foreground">{balance} points</strong>. Contact an admin or check your dashboard for more details.
            </p>
            <Link
              to="/dashboard"
              className="mt-2 inline-block rounded border border-primary/30 px-3 py-1.5 font-heading text-xs text-primary hover:bg-primary/10 transition-all"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 mb-6">
      <div className="flex items-center gap-3">
        <Coins className="h-4 w-4 text-primary shrink-0" />
        <div className="flex-1 flex items-center justify-between">
          <span className="text-xs text-foreground">
            <span className="font-heading font-bold">{balance}</span> points available
          </span>
          <span className="text-[10px] rounded bg-accent/20 px-2 py-0.5 font-heading text-accent-foreground">
            Cost: {toolCost} pts
          </span>
        </div>
      </div>
    </div>
  );
};

export default PointsBalanceBanner;
