import { useState } from "react";
import { Gift, Copy, Check, Users, Star, Heart, CalendarCheck } from "lucide-react";
import { useDailyReward, useReferralCode, useClaimReferral } from "@/hooks/usePointsRewards";
import { toast } from "sonner";

const PointsRewardsPanel = () => {
  const { claimedToday, claim } = useDailyReward();
  const { referralCode, generate } = useReferralCode();
  const claimReferral = useClaimReferral();
  const [copied, setCopied] = useState(false);
  const [referralInput, setReferralInput] = useState("");

  const handleDailyClaim = async () => {
    try {
      await claim.mutateAsync();
      toast.success("Daily bonus claimed! +5 points 🎉");
    } catch (err: any) {
      toast.error(err.message || "Failed to claim");
    }
  };

  const handleGenerateCode = async () => {
    try {
      await generate.mutateAsync();
      toast.success("Referral code generated!");
    } catch {
      toast.error("Failed to generate code");
    }
  };

  const handleCopyCode = () => {
    if (referralCode) {
      const signupLink = `${window.location.origin}/signup?ref=${encodeURIComponent(referralCode)}`;
      navigator.clipboard.writeText(signupLink);
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClaimReferral = async () => {
    if (!referralInput.trim()) return;
    try {
      await claimReferral.mutateAsync(referralInput.trim());
      toast.success("Referral bonus applied! Your referrer earned 25 points 🎉");
      setReferralInput("");
    } catch (err: any) {
      toast.error(err.message || "Invalid referral code");
    }
  };

  const rewardItems = [
    { icon: CalendarCheck, label: "Daily Login", points: "+5 pts/day", color: "text-green-400" },
    { icon: Star, label: "Submit Review", points: "+10 pts", color: "text-yellow-400" },
    { icon: Heart, label: "Favorite Tool", points: "+2 pts", color: "text-red-400" },
    { icon: Users, label: "Refer a Friend", points: "+25 pts", color: "text-blue-400" },
  ];

  return (
    <div className="rounded border border-primary/10 bg-card p-5 border-glow">
      <h2 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
        <Gift className="h-4 w-4 text-primary" />
        Earn Points
      </h2>

      {/* How to earn */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {rewardItems.map((item) => (
          <div key={item.label} className="rounded bg-muted/30 p-3 text-center">
            <item.icon className={`h-5 w-5 mx-auto ${item.color}`} />
            <div className="mt-1 text-[11px] font-semibold text-foreground">{item.label}</div>
            <div className="text-[10px] text-primary font-bold">{item.points}</div>
          </div>
        ))}
      </div>

      {/* Daily Claim */}
      <div className="mt-4 flex items-center justify-between rounded bg-muted/30 px-4 py-3">
        <div>
          <div className="text-xs font-semibold text-foreground">Daily Login Bonus</div>
          <div className="text-[10px] text-muted-foreground">Claim 5 free points every day</div>
        </div>
        <button
          onClick={handleDailyClaim}
          disabled={claimedToday || claim.isPending}
          className="rounded bg-primary px-4 py-2 font-heading text-[11px] font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {claimedToday ? "✅ Claimed" : claim.isPending ? "Claiming..." : "Claim +5"}
        </button>
      </div>

      {/* Referral Code */}
      <div className="mt-3 rounded bg-muted/30 px-4 py-3">
        <div className="text-xs font-semibold text-foreground mb-2">Your Referral Code</div>
        {referralCode ? (
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-background px-3 py-2 text-xs font-mono text-primary border border-primary/20">
              {referralCode}
            </code>
            <button
              onClick={handleCopyCode}
              className="rounded border border-primary/20 p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        ) : (
          <button
            onClick={handleGenerateCode}
            disabled={generate.isPending}
            className="rounded border border-primary/20 px-4 py-2 text-xs text-primary hover:bg-primary/10 transition-colors"
          >
            {generate.isPending ? "Generating..." : "Generate Referral Code"}
          </button>
        )}
        <div className="mt-1 text-[10px] text-muted-foreground">
          Share this code. When someone signs up and uses it, you earn 25 points!
        </div>
      </div>

      {/* Enter Referral Code */}
      <div className="mt-3 rounded bg-muted/30 px-4 py-3">
        <div className="text-xs font-semibold text-foreground mb-2">Have a Referral Code?</div>
        <div className="flex gap-2">
          <input
            value={referralInput}
            onChange={(e) => setReferralInput(e.target.value)}
            placeholder="Enter code..."
            className="flex-1 rounded border border-primary/20 bg-background px-3 py-2 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-primary/50"
          />
          <button
            onClick={handleClaimReferral}
            disabled={!referralInput.trim() || claimReferral.isPending}
            className="rounded bg-secondary px-4 py-2 font-heading text-[11px] font-bold text-secondary-foreground hover:bg-secondary/90 disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default PointsRewardsPanel;
