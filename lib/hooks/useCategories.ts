import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { categoriesSchema, categorySchema } from "@/lib/schemas/category";
import type { Category } from "@/lib/schemas/category";

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const data = await apiFetch<unknown>("/categories");
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
