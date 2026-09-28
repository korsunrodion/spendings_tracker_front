"use client";

import { Skeleton } from "@heroui/react";
import { useGeneralStats } from "@/lib/hooks/useGeneralStats";

function formatAmount(n: number) {
  return `₴${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function StatsCards({ date }: { date: string }) {
  const { data: stats } = useGeneralStats(date);

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-white rounded-2xl shadow-sm px-6 py-4">
        <p className="text-sm text-violet-500 mb-1 font-semibold">
          Current Balance
        </p>
        {stats ? (
          <p className="text-2xl font-bold text-gray-900">
            {formatAmount(stats.totalBalance)}
          </p>
        ) : (
          <Skeleton className="h-7 w-28 rounded mt-1" />
        )}
      </div>
      <div className="bg-white rounded-2xl shadow-sm px-6 py-4">
        <p className="text-sm text-violet-500 mb-1 font-semibold">
          This Month&apos;s Spending
        </p>
        {stats ? (
          <p className="text-2xl font-bold text-gray-900">
            {formatAmount(stats.currentMonthSpendings)}
          </p>
        ) : (
          <Skeleton className="h-7 w-28 rounded mt-1" />
        )}
      </div>
      <div className="bg-white rounded-2xl shadow-sm px-6 py-4">
        <p className="text-sm text-violet-500 mb-1 font-semibold">
          Total Budget
        </p>
        {stats ? (
          <p className="text-2xl font-bold text-gray-900">
            {formatAmount(stats.totalBudget)}
          </p>
        ) : (
          <Skeleton className="h-7 w-28 rounded mt-1" />
        )}
      </div>
    </div>
  );
}
