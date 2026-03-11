import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCallback } from "react";

const COOLDOWN_MS = 5000;
const lastInsertedAt = new Map<string, number>();

export const useTrackToolUsage = () => {
  const { user } = useAuth();

  const trackUsage = useCallback(
    async (toolId: string, toolName: string, category: string) => {
      const now = Date.now();
      const last = lastInsertedAt.get(toolId) ?? 0;
      if (now - last < COOLDOWN_MS) {
        return; // Skip — already tracked recently
      }
      lastInsertedAt.set(toolId, now);

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
