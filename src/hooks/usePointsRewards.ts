import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useDailyReward = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: claimedToday = false, isLoading } = useQuery({
    queryKey: ["daily-reward-claimed", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("daily_reward_claims" as any)
        .select("id")
        .eq("user_id", user.id)
        .eq("claimed_date", today)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  const claim = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.rpc("claim_daily_reward" as any, {
        p_user_id: user.id,
      });
      if (error) throw error;
      const result = data as any;
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["daily-reward-claimed"] });
      qc.invalidateQueries({ queryKey: ["points-balance"] });
      qc.invalidateQueries({ queryKey: ["points-transactions"] });
    },
  });

  return { claimedToday, isLoading, claim };
};

export const useReferralCode = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: referralCode, isLoading } = useQuery({
    queryKey: ["referral-code", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("referral_codes" as any)
        .select("code")
        .eq("user_id", user.id)
        .maybeSingle();
      return (data as any)?.code || null;
    },
    enabled: !!user,
  });

  const generate = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const code = `TVK-${user.id.slice(0, 4).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const { error } = await supabase
        .from("referral_codes" as any)
        .insert({ user_id: user.id, code } as any);
      if (error) throw error;
      return code;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referral-code"] });
    },
  });

  return { referralCode, isLoading, generate };
};

export const useClaimReferral = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.rpc("claim_referral_bonus" as any, {
        p_referral_code: code,
        p_referred_user_id: user.id,
      });
      if (error) throw error;
      const result = data as any;
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["points-balance"] });
      qc.invalidateQueries({ queryKey: ["points-transactions"] });
    },
  });
};
