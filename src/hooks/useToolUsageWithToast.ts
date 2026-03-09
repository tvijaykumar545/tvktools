import { useCallback } from "react";
import { useUsageLimit } from "./useUsageLimit";
import { useToast } from "./use-toast";

export const useToolUsageWithToast = () => {
  const { remaining, isLimitReached, consumeUsage, isGuest } = useUsageLimit();
  const { toast } = useToast();

  const trackToolUsage = useCallback(() => {
    if (isLimitReached) {
      toast({
        title: "Daily Limit Reached",
        description: "Sign up for a free account to unlock unlimited access.",
        variant: "destructive",
      });
      return false;
    }

    const success = consumeUsage();
    if (success && isGuest) {
      const newRemaining = remaining - 1;
      if (newRemaining > 0) {
        toast({
          title: `${newRemaining} ${newRemaining === 1 ? "use" : "uses"} left today`,
          description: "Sign up for unlimited access →",
        });
      } else {
        toast({
          title: "Daily Limit Reached",
          description: "Sign up for a free account to unlock unlimited access.",
          variant: "destructive",
        });
      }
    }

    return success;
  }, [remaining, isLimitReached, consumeUsage, isGuest, toast]);

  return trackToolUsage;
};
