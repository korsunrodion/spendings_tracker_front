import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import {
  transactionsSchema,
  transactionSchema,
} from "@/lib/schemas/transaction";
import type { Transaction } from "@/lib/schemas/transaction";

interface UseTransactionsParams {
  category?: string;
  from?: string;
  to?: string;
}

export function useTransactions(params?: UseTransactionsParams) {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set("category", params.category);
  if (params?.from) searchParams.set("from", params.from);
  if (params?.to) searchParams.set("to", params.to);

  const query = searchParams.toString();

  return useQuery<Transaction[]>({
    queryKey: ["transactions", params],
    queryFn: async () => {
      const data = await apiFetch<unknown>(
        `/transactions${query ? `?${query}` : ""}`
      );
      return transactionsSchema.parse(data);
    },
  });
}

export function useEditTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, category }: { id: string; category: string }) =>
      apiFetch(`/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useTransaction(id: string) {
  return useQuery<Transaction>({
    queryKey: ["transactions", id],
    queryFn: async () => {
      const data = await apiFetch<unknown>(`/transactions/${id}`);
      return transactionSchema.parse(data);
    },
    enabled: Boolean(id),
  });
}
