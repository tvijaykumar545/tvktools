import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Favorite {
  id: string;
  tool_id: string;
  tool_name: string;
  category: string;
  created_at: string;
}

export const useToolFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("tool_favorites" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setFavorites(((data as unknown) as Favorite[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback(
    (toolId: string) => favorites.some((f) => f.tool_id === toolId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (toolId: string, toolName: string, category: string) => {
      if (!user) {
        toast.error("Please sign in to bookmark tools");
        return;
      }
      const existing = favorites.find((f) => f.tool_id === toolId);
      if (existing) {
        await supabase.from("tool_favorites" as any).delete().eq("id", existing.id);
        setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
        toast.success("Removed from favorites");
      } else {
        const { data } = await supabase
          .from("tool_favorites" as any)
          .insert({ user_id: user.id, tool_id: toolId, tool_name: toolName, category })
          .select()
          .single();
        if (data) {
          setFavorites((prev) => [(data as unknown as Favorite), ...prev]);
          toast.success("Added to favorites!");
        }
      }
    },
    [user, favorites]
  );

  return { favorites, loading, isFavorite, toggleFavorite };
};
