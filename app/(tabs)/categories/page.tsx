"use client";

import { Card, CardBody, CardHeader, Divider, Progress, Skeleton } from "@heroui/react";
import { MdAccountBalanceWallet } from "react-icons/md";
import { useCategories } from "@/lib/hooks/useCategories";
import type { Category } from "@/lib/schemas/category";

function formatAmount(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function CategoryCard({ category }: { category: Category }) {
  const { name, budget, currentAmount } = category;
  const percent = budget > 0 ? Math.min((currentAmount / budget) * 100, 100) : 0;
  const isOverBudget = currentAmount > budget;
  const remaining = budget - currentAmount;

  return (
    <Card>
      <CardBody className="gap-3">
        <div className="flex justify-between items-center">
          <span className="font-semibold">{name}</span>
          <span className={`text-sm font-medium ${isOverBudget ? "text-danger" : "text-success"}`}>
            {isOverBudget
              ? `${formatAmount(Math.abs(remaining))} over`
              : `${formatAmount(remaining)} left`}
          </span>
        </div>
        <Progress
          value={percent}
          color={isOverBudget ? "danger" : percent >= 80 ? "warning" : "success"}
          size="sm"
          aria-label={`${name} budget progress`}
        />
        <div className="flex justify-between text-sm text-default-500">
          <span>Spent: {formatAmount(currentAmount)}</span>
          <span>Budget: {formatAmount(budget)}</span>
        </div>
      </CardBody>
    </Card>
  );
}

function CategoryCardSkeleton() {
  return (
    <Card>
      <CardBody className="gap-3">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-28 rounded-lg" />
          <Skeleton className="h-5 w-20 rounded-lg" />
        </div>
        <Skeleton className="h-2 w-full rounded-lg" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="h-4 w-24 rounded-lg" />
        </div>
      </CardBody>
    </Card>
  );
}

export default function CategoriesPage() {
  const { data: categories, isLoading, isError } = useCategories();

  const totalBudget = categories?.reduce((sum, c) => sum + c.budget, 0) ?? 0;
  const totalSpent = categories?.reduce((sum, c) => sum + c.currentAmount, 0) ?? 0;
  const totalPercent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Budget</h1>

      <Card>
        <CardHeader className="flex gap-3">
          <MdAccountBalanceWallet size={24} className="text-primary" />
          <span className="text-lg font-semibold">Overview</span>
        </CardHeader>
        <Divider />
        <CardBody className="gap-3">
          {isLoading ? (
            <>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24 rounded-lg" />
                <Skeleton className="h-4 w-32 rounded-lg" />
              </div>
              <Skeleton className="h-3 w-full rounded-lg" />
            </>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-default-500">Total spent</span>
                <span className="font-semibold">
                  {formatAmount(totalSpent)}{" "}
                  <span className="text-default-400 font-normal">/ {formatAmount(totalBudget)}</span>
                </span>
              </div>
              <Progress
                value={totalPercent}
                color={totalSpent > totalBudget ? "danger" : totalPercent >= 80 ? "warning" : "primary"}
                aria-label="Total budget progress"
              />
            </>
          )}
        </CardBody>
      </Card>

      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => <CategoryCardSkeleton key={i} />)
      ) : isError ? (
        <p className="text-danger text-center py-8">Failed to load categories.</p>
      ) : !categories?.length ? (
        <p className="text-default-500 text-center py-8">No categories yet.</p>
      ) : (
        categories.map((category) => (
          <CategoryCard key={category._id} category={category} />
        ))
      )}
    </div>
  );
}
