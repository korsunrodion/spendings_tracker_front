import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { categoriesSchema, categorySchema } from "@/lib/schemas/category";
import type { Category } from "@/lib/schemas/category";

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const data = await apiFetch<unknown>("/categories/with-amounts");
      return categoriesSchema.parse(data);
    },
  });
}

export function useCategory(id: string) {
  return useQuery<Category>({
    queryKey: ["categories", id],
    queryFn: async () => {
      const data = await apiFetch<unknown>(`/categories/${id}`);
      return categorySchema.parse(data);
    },
    enabled: Boolean(id),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategoryName() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      apiFetch(`/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories", id] });
    },
  });
}

export function useUpdateCategoryBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, budget }: { id: string; budget: number }) =>
      apiFetch(`/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget }),
      }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories", id] });
    },
  });
}

export function useUpdateCategoryPositions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (positions: { _id: string; position: number }[]) =>
      apiFetch("/categories/positions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positions }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
