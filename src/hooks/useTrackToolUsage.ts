import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCallback } from "react";

const DEBOUNCE_MS = 3000;
const lastTrackedMap = new Map<string, number>();

export const useTrackToolUsage = () => {
  const { user } = useAuth();

  const trackUsage = useCallback(
    async (toolId: string, toolName: string, category: string) => {
      const now = Date.now();
      const lastTime = lastTrackedMap.get(toolId);
      if (lastTime && now - lastTime < DEBOUNCE_MS) {
        return;
      }
      lastTrackedMap.set(toolId, now);

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
