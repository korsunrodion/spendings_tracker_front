import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface GeneralStats {
  totalBalance: number;
  currentMonthSpendings: number;
  totalBudget: number;
}

export function useGeneralStats(date?: string) {
  return useQuery<GeneralStats>({
    queryKey: ["generalStats", date],
    queryFn: () =>
      apiFetch<GeneralStats>(
        `/general/stats${date ? `?date=${date}` : ""}`
      ),
  });
}
