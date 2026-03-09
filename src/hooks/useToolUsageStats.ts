import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UsageStats {
  totalUses: number;
  toolBreakdown: { tool_name: string; count: number }[];
  categoryBreakdown: { category: string; count: number }[];
  hourlyBreakdown: { hour: string; count: number }[];
  recentTools: { tool_id: string; tool_name: string; created_at: string }[];
  loading: boolean;
}

export const useToolUsageStats = (): UsageStats => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UsageStats>({
    totalUses: 0,
    toolBreakdown: [],
    categoryBreakdown: [],
    hourlyBreakdown: [],
    recentTools: [],
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setStats((s) => ({ ...s, loading: false }));
      return;
    }

    const fetchStats = async () => {
      const { data: allUsage } = await supabase
        .from("tool_usage")
        .select("tool_id, tool_name, category, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!allUsage) {
        setStats((s) => ({ ...s, loading: false }));
        return;
      }

      const toolCounts: Record<string, number> = {};
      const catCounts: Record<string, number> = {};
      allUsage.forEach((u) => {
        toolCounts[u.tool_name] = (toolCounts[u.tool_name] || 0) + 1;
        catCounts[u.category] = (catCounts[u.category] || 0) + 1;
      });

      setStats({
        totalUses: allUsage.length,
        toolBreakdown: Object.entries(toolCounts)
          .map(([tool_name, count]) => ({ tool_name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        categoryBreakdown: Object.entries(catCounts)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count),
        recentTools: allUsage,
        loading: false,
      });
    };

    fetchStats();
  }, [user]);

  return stats;
};
