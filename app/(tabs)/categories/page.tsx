"use client";

import { useCategoryGroups } from "@/lib/hooks/useCategoryGroups";
import type { Category, CategoryGroup } from "@/lib/schemas/category";
import { Button, Skeleton } from "@heroui/react";
import {
  MdAdd,
  MdMoreVert,
  MdKeyboardArrowDown,
  MdDragIndicator,
} from "react-icons/md";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatMoney(n: number) {
  return `$${Math.round(n).toLocaleString()}`;
}

function getBarColor(percent: number) {
  if (percent >= 100) return "bg-red-500";
  if (percent >= 80) return "bg-orange-400";
  return "bg-violet-600";
}

function getPercentColor(percent: number) {
  if (percent >= 100) return "text-red-500";
  if (percent >= 80) return "text-orange-400";
  return "text-green-500";
}

const ICON_COLORS = [
  "bg-red-400",
  "bg-orange-400",
  "bg-violet-500",
  "bg-pink-400",
  "bg-blue-400",
  "bg-amber-500",
  "bg-indigo-500",
];

function getIconColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return ICON_COLORS[Math.abs(h) % ICON_COLORS.length];
}

function CategoryRow({ category }: { category: Category }) {
  const budget = category.budget ?? 0;
  const current = category.currentAmount ?? 0;
  const percent = budget > 0 ? (current / budget) * 100 : 0;

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div
        className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center ${getIconColor(
          category.name
        )}`}
      >
        <span className="text-white text-sm font-bold">
          {category.name[0].toUpperCase()}
        </span>
      </div>

      <span className="text-sm font-medium text-gray-800 w-[90px] flex-shrink-0 truncate">
        {category.name}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-violet-600">
            {formatMoney(current)} of {formatMoney(budget)}
          </span>
          <span className={`text-xs font-semibold ${getPercentColor(percent)}`}>
            {Math.round(percent)}%
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${getBarColor(percent)}`}
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
      </div>

      <button className="text-gray-400 flex-shrink-0 p-0.5 hover:text-gray-600">
        <MdMoreVert size={18} />
      </button>
    </div>
  );
}

function CategoryRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
      <Skeleton className="h-4 w-20 rounded flex-shrink-0" />
      <div className="flex-1">
        <div className="flex justify-between mb-1.5">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-3 w-8 rounded" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
    </div>
  );
}

function GroupSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3">
        <Skeleton className="h-3 w-3 rounded flex-shrink-0" />
        <Skeleton className="h-3 w-32 rounded" />
        <Skeleton className="h-5 w-24 rounded-full" />
        <div className="flex-1" />
        <Skeleton className="h-4 w-24 rounded" />
      </div>
      <div className="border-t border-gray-100 divide-y divide-gray-100">
        {[1, 2, 3].map((i) => (
          <CategoryRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function CategoryGroupCard({ group }: { group: CategoryGroup }) {
  const categories = [...group.categories].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0)
  );
  const totalBudget = categories.reduce((sum, c) => sum + (c.budget ?? 0), 0);
  const totalCurrent = categories.reduce(
    (sum, c) => sum + (c.currentAmount ?? 0),
    0
  );

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3">
        <MdDragIndicator
          size={18}
          className="text-gray-300 cursor-grab flex-shrink-0"
        />
        <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">
          {group.name}
        </span>
        <span className="text-xs bg-violet-100 text-violet-700 font-medium px-2 py-0.5 rounded-full flex-shrink-0">
          {categories.length}{" "}
          {categories.length === 1 ? "Category" : "Categories"}
        </span>
        <div className="flex-1" />
        <span className="text-sm font-semibold text-gray-700 flex-shrink-0">
          {formatMoney(totalCurrent)} / {formatMoney(totalBudget)}
        </span>
      </div>

      <div className="border-t border-gray-100 divide-y divide-gray-100">
        {categories.map((cat) => (
          <CategoryRow key={cat._id} category={cat} />
        ))}
      </div>

      <div className="border-t border-gray-100 px-4 py-2.5">
        <button className="flex items-center gap-1 text-sm text-violet-600 font-medium hover:text-violet-700 transition-colors">
          <MdAdd size={16} />
          <span>Add Category to Group</span>
        </button>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const { data: groups, isLoading: groupsLoading } = useCategoryGroups();
  const isLoading = groupsLoading;

  const now = new Date();
  const monthLabel = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

  const sortedGroups = [...(groups ?? [])].sort(
    (a, b) => a.position - b.position
  );

  return (
    <div className="flex flex-col min-h-full bg-[#f5f3ff]">
      {/* Top navbar */}
      <div className="bg-white">
        <div className="flex items-center justify-between py-6 max-w-[1024px] mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">FF</span>
            </div>
            <span className="font-semibold text-gray-900">FinanceFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="bordered"
              color="secondary"
              startContent={<MdAdd size={15} />}
            >
              Add Group
            </Button>
            <div className="w-8 h-8 bg-amber-200 rounded-full flex-shrink-0" />
          </div>
        </div>
      </div>
      {/* Page header */}
      <div className="mx-auto max-w-[1024px] w-full">
        <div className="px-4 pt-5 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Category Management
              </h1>
              <p className="text-sm text-violet-600 mt-0.5">
                Organize your spending into groups
              </p>
            </div>
            <button className="flex items-center gap-1 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm flex-shrink-0 mt-1">
              {monthLabel}
              <MdKeyboardArrowDown size={16} />
            </button>
          </div>
        </div>

        {/* Groups list */}
        <div className="flex flex-col gap-3 px-4 pb-6">
          {isLoading ? (
            <>
              <GroupSkeleton />
              <GroupSkeleton />
            </>
          ) : (
            <>
              {sortedGroups.map((group) => (
                <CategoryGroupCard key={group._id} group={group} />
              ))}

              {/* Add group placeholder */}
              <button className="border-2 border-dashed border-violet-200 rounded-2xl p-6 flex flex-col items-center gap-2 text-violet-400 hover:border-violet-300 hover:text-violet-500 transition-colors">
                <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center">
                  <MdAdd size={22} className="text-violet-400" />
                </div>
                <span className="text-sm font-medium">
                  Create Category Group
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
