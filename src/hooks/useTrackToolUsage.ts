import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCallback } from "react";

const DEBOUNCE_MS = 5000;
const pendingTimers = new Map<string, ReturnType<typeof setTimeout>>();

export const useTrackToolUsage = () => {
  const { user } = useAuth();

  const trackUsage = useCallback(
    (toolId: string, toolName: string, category: string) => {
      // Clear any existing pending timer for this tool
      const existing = pendingTimers.get(toolId);
      if (existing) {
        clearTimeout(existing);
      }

      // Set a new debounced timer — only fires once after rapid clicks settle
      const timer = setTimeout(async () => {
        pendingTimers.delete(toolId);
        await supabase.from("tool_usage").insert({
          user_id: user?.id ?? null,
          tool_id: toolId,
          tool_name: toolName,
          category,
        });
      }, 500);

      pendingTimers.set(toolId, timer);
    },
    [user]
  );

  return { trackUsage };
};
