"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Divider } from "@heroui/react";
import {
  MdAccountBalanceWallet,
  MdReceiptLong,
  MdBarChart,
} from "react-icons/md";

const tabs = [
  {
    href: "/categories",
    label: "Budget",
    icon: MdAccountBalanceWallet,
  },
  {
    href: "/transactions",
    label: "Transactions",
    icon: MdReceiptLong,
  },
  {
    href: "/statistics",
    label: "Statistics",
    icon: MdBarChart,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 flex flex-col bg-white">
      <Divider />
      <div className="flex flex-1 max-w-[768px] mx-auto w-full">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-default-400 hover:text-default-600"
              }`}
            >
              <Icon size={24} />
              <span className="font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
