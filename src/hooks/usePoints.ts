import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PointsTransaction {
  id: string;
  user_id: string;
  tool_id: string | null;
  tool_name: string | null;
  points_used: number;
  action_type: "use" | "add" | "deduct";
  description: string;
  admin_id: string | null;
  balance_after: number;
  created_at: string;
}

export const usePointsBalance = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["points-balance", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data, error } = await supabase
        .from("profiles")
        .select("points_balance")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return (data as any)?.points_balance ?? 0;
    },
    enabled: !!user,
  });
};

export const usePointsTransactions = (userId?: string) => {
  const { user } = useAuth();
  const targetId = userId || user?.id;
  return useQuery({
    queryKey: ["points-transactions", targetId],
    queryFn: async () => {
      if (!targetId) return [];
      const { data, error } = await supabase
        .from("points_transactions" as any)
        .select("*")
        .eq("user_id", targetId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data as unknown as PointsTransaction[]) || [];
    },
    enabled: !!targetId,
  });
};

export const useDeductPoints = () => {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      toolId,
      toolName,
      pointsCost,
    }: {
      toolId: string;
      toolName: string;
      pointsCost: number;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.rpc("deduct_tool_points" as any, {
        p_user_id: user.id,
        p_tool_id: toolId,
        p_tool_name: toolName,
        p_points_cost: pointsCost,
      });
      if (error) throw error;
      const result = data as any;
      if (!result.success) {
        throw new Error(result.error || "Failed to deduct points");
      }
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["points-balance"] });
      qc.invalidateQueries({ queryKey: ["points-transactions"] });
    },
  });
};

export const useAdminAdjustPoints = () => {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      targetUserId,
      points,
      action,
      description,
    }: {
      targetUserId: string;
      points: number;
      action: "add" | "deduct";
      description?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.rpc("admin_adjust_points" as any, {
        p_admin_id: user.id,
        p_user_id: targetUserId,
        p_points: points,
        p_action: action,
        p_description: description || "",
      });
      if (error) throw error;
      const result = data as any;
      if (!result.success) {
        throw new Error(result.error || "Failed to adjust points");
      }
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["points-balance"] });
      qc.invalidateQueries({ queryKey: ["points-transactions"] });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

export const useToolPointsCost = (toolId?: string) => {
  return useQuery({
    queryKey: ["tool-points-cost", toolId],
    queryFn: async () => {
      if (!toolId) return 0;
      const { data, error } = await supabase
        .from("managed_tools" as any)
        .select("points_cost")
        .eq("id", toolId)
        .single();
      if (error) return 0;
      return (data as any)?.points_cost ?? 0;
    },
    enabled: !!toolId,
  });
};
