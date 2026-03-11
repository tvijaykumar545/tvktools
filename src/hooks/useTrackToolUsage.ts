import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useRef } from "react";

const DEBOUNCE_MS = 3000;

export const useTrackToolUsage = () => {
  const { user } = useAuth();
  const lastTracked = useRef<{ toolId: string; timestamp: number } | null>(null);

  const trackUsage = useCallback(
    async (toolId: string, toolName: string, category: string) => {
      const now = Date.now();
      if (
        lastTracked.current &&
        lastTracked.current.toolId === toolId &&
        now - lastTracked.current.timestamp < DEBOUNCE_MS
      ) {
        return;
      }
      lastTracked.current = { toolId, timestamp: now };

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
