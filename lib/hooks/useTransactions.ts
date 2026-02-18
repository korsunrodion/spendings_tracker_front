import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { transactionsSchema, transactionSchema } from "@/lib/schemas/transaction";
import type { Transaction } from "@/lib/schemas/transaction";

interface UseTransactionsParams {
  categoryId?: string;
}

export function useTransactions(params?: UseTransactionsParams) {
  const searchParams = new URLSearchParams();
  if (params?.categoryId) searchParams.set("categoryId", params.categoryId);

  const query = searchParams.toString();

  return useQuery<Transaction[]>({
    queryKey: ["transactions", params],
    queryFn: async () => {
      const data = await apiFetch<unknown>(`/transactions${query ? `?${query}` : ""}`);
      return transactionsSchema.parse(data);
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
