import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import {
  categoryGroupsSchema,
  categoryGroupSchema,
} from "@/lib/schemas/category";
import type { CategoryGroup } from "@/lib/schemas/category";

export function useCategoryGroups(params: {
  startDate: string;
  endDate: string;
}) {
  return useQuery<CategoryGroup[]>({
    queryKey: ["category-groups", params.startDate, params.endDate],
    queryFn: async () => {
      const qs = new URLSearchParams({
        startDate: params.startDate,
        endDate: params.endDate,
      });
      const data = await apiFetch<unknown>(`/category-groups?${qs}`);
      return categoryGroupsSchema.parse(data);
    },
  });
}

export function useCategoryGroup(id: string) {
  return useQuery<CategoryGroup>({
    queryKey: ["category-groups", id],
    queryFn: async () => {
      const data = await apiFetch<unknown>(`/category-groups/${id}`);
      return categoryGroupSchema.parse(data);
    },
    enabled: Boolean(id),
  });
}

export function useDeleteCategoryGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/category-groups/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-groups"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useRenameCategoryGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      apiFetch(`/category-groups/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["category-groups"] });
      queryClient.invalidateQueries({ queryKey: ["category-groups", id] });
    },
  });
}

export function useUpdateCategoryGroupPositions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (positions: { _id: string; position: number }[]) =>
      apiFetch("/category-groups/positions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(positions),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-groups"] });
    },
  });
}
