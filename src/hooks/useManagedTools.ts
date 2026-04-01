import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tool, ToolCategory } from "@/data/tools";

export interface ManagedTool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  is_free: boolean;
  is_popular: boolean;
  is_new: boolean;
  type: string;
  sort_order: number;
  is_active: boolean;
  points_cost: number;
  created_at: string;
  updated_at: string;
}

// Convert DB tool to frontend Tool shape
const toFrontendTool = (t: ManagedTool): Tool => ({
  id: t.id,
  name: t.name,
  description: t.description,
  category: t.category as ToolCategory,
  icon: t.icon,
  isFree: t.is_free,
  isPopular: t.is_popular,
  isNew: t.is_new,
  type: t.type as "frontend" | "backend",
  pointsCost: t.points_cost,
});

export const useManagedTools = () => {
  return useQuery({
    queryKey: ["managed-tools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("managed_tools" as any)
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data as unknown as ManagedTool[]).map(toFrontendTool);
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Admin-only: fetch all tools including inactive
export const useAdminManagedTools = () => {
  return useQuery({
    queryKey: ["admin-managed-tools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("managed_tools" as any)
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as unknown as ManagedTool[];
    },
  });
};

export const useCreateTool = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tool: Omit<ManagedTool, "created_at" | "updated_at">) => {
      const { error } = await supabase.from("managed_tools" as any).insert(tool as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["managed-tools"] });
      qc.invalidateQueries({ queryKey: ["admin-managed-tools"] });
    },
  });
};

export const useUpdateTool = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ManagedTool> & { id: string }) => {
      const { error } = await supabase.from("managed_tools" as any).update(updates as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["managed-tools"] });
      qc.invalidateQueries({ queryKey: ["admin-managed-tools"] });
    },
  });
};

export const useDeleteTool = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("managed_tools" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["managed-tools"] });
      qc.invalidateQueries({ queryKey: ["admin-managed-tools"] });
    },
  });
};
