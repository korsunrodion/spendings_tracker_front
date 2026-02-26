"use client";

import { Suspense, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
} from "@heroui/react";
import {
  MdChevronLeft,
  MdChevronRight,
  MdTune,
  MdReceiptLong,
} from "react-icons/md";
import { useCategoryGroups } from "@/lib/hooks/useCategoryGroups";
import {
  useEditCategoryByDescription,
  useEditTransaction,
  useTransactions,
} from "@/lib/hooks/useTransactions";
import type { Transaction } from "@/lib/schemas/transaction";

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

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getMonthRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { startDate: toDateString(start), endDate: toDateString(end) };
}

function formatAmount(n: number) {
  return `₴${Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
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

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function getDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  if (isSameDay(date, today)) return "Today";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

function groupTransactions(transactions: Transaction[]) {
  const map = new Map<
    string,
    { label: string; date: Date; items: Transaction[] }
  >();

  for (const tx of transactions) {
    if (!tx.date) continue;
    const key = getDateKey(tx.date);
    if (!map.has(key)) {
      map.set(key, {
        label: getDateLabel(tx.date),
        date: new Date(tx.date),
        items: [],
      });
    }
    map.get(key)!.items.push(tx);
  }

  return [...map.values()].sort((a, b) => b.date.getTime() - a.date.getTime());
}

function PrivatLogo() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <rect width="20" height="20" rx="4" fill="#009966" />
      <text
        x="10"
        y="14"
        textAnchor="middle"
        fill="white"
        fontSize="11"
        fontWeight="bold"
        fontFamily="Arial"
      >
        P
      </text>
    </svg>
  );
}

function MonoLogo() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <rect width="20" height="20" rx="4" fill="#1a1a2e" />
      {/* cat ears */}
      <polygon points="3,9 6,4 9,9" fill="white" />
      <polygon points="11,9 14,4 17,9" fill="white" />
      {/* cat face */}
      <ellipse cx="10" cy="12" rx="7" ry="6" fill="white" />
      <circle cx="7.5" cy="11.5" r="1" fill="#1a1a2e" />
      <circle cx="12.5" cy="11.5" r="1" fill="#1a1a2e" />
      <path
        d="M8.5 14 Q10 15.5 11.5 14"
        stroke="#1a1a2e"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function BankBadge({ source }: { source: "privat" | "mono" }) {
  return (
    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded drop-shadow-sm">
      {source === "privat" ? <PrivatLogo /> : <MonoLogo />}
    </div>
  );
}

function TransactionRow({
  transaction,
  expenseCategories,
  incomeCategories,
}: {
  transaction: Transaction;
  expenseCategories: { _id: string; name: string }[];
  incomeCategories: { _id: string; name: string }[];
}) {
  const categories = transaction.sum > 0 ? incomeCategories : expenseCategories;
  const { mutate: editTransaction, isPending: isSaving } = useEditTransaction();
  const { mutate: editByDescription, isPending: isSavingAll } =
    useEditCategoryByDescription();
  const [editingCategory, setEditingCategory] = useState(false);
  const [pendingCategory, setPendingCategory] = useState(transaction.category);
  const [pendingNote, setPendingNote] = useState(transaction.note ?? "");

  const isPositive = transaction.sum > 0;
  const time = transaction.date ? formatTime(transaction.date) : "";
  const isUnclassified =
    transaction.category.name.toLowerCase() === "unclassified";
  const isBusy = isSaving || isSavingAll;

  function handleSave() {
    editTransaction(
      { id: transaction._id, category: pendingCategory._id, note: pendingNote },
      { onSettled: () => setEditingCategory(false) }
    );
  }

  function handleSaveAll() {
    editByDescription(
      {
        description: transaction.description,
        categoryName: pendingCategory.name,
      },
      { onSettled: () => setEditingCategory(false) }
    );
  }

  function handleStartEdit() {
    const validName = categories.find(
      (c) => c.name === transaction.category.name
    )
      ? transaction.category
      : categories[0] ?? transaction.category;
    setPendingCategory(validName);
    setPendingNote(transaction.note ?? "");
    setEditingCategory(true);
  }

  function handleCancel() {
    setEditingCategory(false);
  }

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 ${
        isUnclassified ? "bg-amber-50 border-l-2 border-amber-400" : ""
      }`}
    >
      <div className="relative flex-shrink-0">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconColor(
            transaction.category.name
          )}`}
        >
          <span className="text-white text-sm font-bold">
            {transaction.category.name[0].toUpperCase()}
          </span>
        </div>
        {transaction.source && <BankBadge source={transaction.source} />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">
          {transaction.description}
        </p>
        <div className="text-xs text-gray-400 mt-0.5">
          {editingCategory ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1">
                {time && <span>{time} • </span>}
                <select
                  autoFocus
                  value={pendingCategory.name}
                  onChange={(e) =>
                    setPendingCategory(
                      categories.find((c) => c._id === e.target.value) ??
                        categories[0]
                    )
                  }
                  className="text-violet-500 text-xs outline-none bg-transparent cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                value={pendingNote}
                onChange={(e) => setPendingNote(e.target.value)}
                placeholder="Add a note…"
                className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-violet-400 w-full"
              />
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSave}
                  disabled={isBusy}
                  className="px-2 py-0.5 text-xs font-medium bg-violet-500 text-white rounded-full hover:bg-violet-600 disabled:opacity-50 cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={handleSaveAll}
                  disabled={isBusy}
                  className="px-2 py-0.5 text-xs font-medium bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
                >
                  Save all with description
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isBusy}
                  className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {time && `${time} • `}
              <span
                className="text-violet-500 cursor-pointer hover:text-violet-700"
                onClick={handleStartEdit}
              >
                {transaction.category.name}
              </span>
              {transaction.note && (
                <span className="ml-1.5 text-gray-400 italic">
                  — {transaction.note}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <span
        className={`text-sm font-bold flex-shrink-0 ${
          isPositive ? "text-green-500" : "text-red-500"
        }`}
      >
        {isPositive ? "+" : "-"}
        {formatAmount(transaction.sum)}
      </span>
    </div>
  );
}

function TransactionRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-40 rounded mb-1.5" />
        <Skeleton className="h-3 w-24 rounded" />
      </div>
      <Skeleton className="h-4 w-16 rounded" />
    </div>
  );
}

function TransactionsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") ?? "";

  const [selectedDate, setSelectedDate] = useState(() => {
    const fromParam = searchParams.get("from");
    if (fromParam) {
      const d = new Date(fromParam + "T00:00:00");
      if (!isNaN(d.getTime()))
        return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });

  const { startDate, endDate } = getMonthRange(selectedDate);
  const monthLabel = `${MONTHS[selectedDate.getMonth()].slice(
    0,
    3
  )} ${selectedDate.getFullYear()}`;

  function setMonth(date: Date) {
    setSelectedDate(date);
    const { startDate: from, endDate: to } = getMonthRange(date);
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", from);
    params.set("to", to);
    router.replace(`${pathname}?${params.toString()}`);
  }

  function setCategory(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("category", id);
    else params.delete("category");
    router.replace(`${pathname}?${params.toString()}`);
  }

  const { data: expenseGroups } = useCategoryGroups({
    startDate,
    endDate,
    type: "expense",
  });
  const { data: incomeGroups } = useCategoryGroups({
    startDate,
    endDate,
    type: "income",
  });
  const expenseCategories = expenseGroups?.flatMap((g) => g.categories) ?? [];
  const incomeCategories = incomeGroups?.flatMap((g) => g.categories) ?? [];
  const allCategories = [...expenseCategories, ...incomeCategories];

  const {
    data: transactions,
    isLoading,
    isError,
  } = useTransactions({
    category: category || undefined,
    from: startDate,
    to: endDate,
  });

  const grouped = groupTransactions(transactions ?? []);

  return (
    <div className="flex flex-col min-h-full bg-[#f5f3ff]">
      {/* Header */}
      <div className="bg-white">
        <div className="flex items-center justify-between py-5 px-4 max-w-[1024px] mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">FF</span>
            </div>
            <span className="font-semibold text-gray-900">Transactions</span>
          </div>
          <div className="w-8 h-8 bg-amber-200 rounded-full flex-shrink-0" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-100">
        <div className="px-4 py-3 flex items-center gap-2 max-w-[1024px] mx-auto">
          <div className="relative flex-1 min-w-0">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none appearance-none cursor-pointer"
            >
              <option value="">All categories</option>
              {allCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          <Popover placement="bottom-end">
            <PopoverTrigger>
              <button className="flex items-center gap-1.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-shrink-0 cursor-pointer">
                <MdTune size={16} className="text-gray-500" />
                {monthLabel}
              </button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="flex items-center gap-2 px-1 py-1">
                <button
                  className="p-1 rounded hover:bg-gray-100 text-gray-600 cursor-pointer"
                  onClick={() =>
                    setMonth(
                      new Date(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth() - 1,
                        1
                      )
                    )
                  }
                >
                  <MdChevronLeft size={20} />
                </button>
                <span className="text-sm font-medium w-32 text-center text-black">
                  {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </span>
                <button
                  className="p-1 rounded hover:bg-gray-100 text-gray-600 cursor-pointer"
                  onClick={() =>
                    setMonth(
                      new Date(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth() + 1,
                        1
                      )
                    )
                  }
                >
                  <MdChevronRight size={20} />
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Transactions list */}
      <div className="flex-1 max-w-[1024px] w-full mx-auto px-4 py-4 flex flex-col gap-4">
        {isError ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-red-400 py-20">
            <MdReceiptLong size={40} />
            <span className="text-sm">Failed to load transactions</span>
          </div>
        ) : isLoading ? (
          <>
            {[1, 2].map((g) => (
              <div key={g}>
                <div className="h-3 w-20 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
                  {[1, 2, 3].map((i) => (
                    <TransactionRowSkeleton key={i} />
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : grouped.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-400 py-20">
            <MdReceiptLong size={40} />
            <span className="text-sm">No transactions found</span>
          </div>
        ) : (
          grouped.map(({ label, items }) => (
            <div key={label}>
              <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">
                {label}
              </p>
              <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
                {items.map((tx) => (
                  <TransactionRow
                    key={tx._id}
                    transaction={tx}
                    expenseCategories={expenseCategories}
                    incomeCategories={incomeCategories}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense>
      <TransactionsContent />
    </Suspense>
  );
}
