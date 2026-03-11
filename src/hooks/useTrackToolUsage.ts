import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCallback } from "react";

export const useTrackToolUsage = () => {
  const { user } = useAuth();

  const trackUsage = useCallback(
    async (toolId: string, toolName: string, category: string) => {
      await supabase.from("tool_usage").insert({
        user_id: user?.id ?? null,
        tool_id: toolId,
        tool_name: toolName,
        category,
      });
    },
    [user]
  );

  return { trackUsage };
};
