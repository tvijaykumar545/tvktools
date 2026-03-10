import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MostUsedTool {
  tool_id: string;
  tool_name: string;
  category: string;
  usage_count: number;
}

export const useMostUsedTools = (limit = 8) => {
  return useQuery({
    queryKey: ["most-used-tools", limit],
    queryFn: async (): Promise<MostUsedTool[]> => {
      const { data, error } = await supabase.rpc("get_most_used_tools", {
        limit_count: limit,
      });
      if (error) throw error;
      return (data as MostUsedTool[]) ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
};
