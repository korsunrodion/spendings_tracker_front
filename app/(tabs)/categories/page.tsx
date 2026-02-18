"use client";

import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { MdAccountBalanceWallet } from "react-icons/md";

export default function CategoriesPage() {
  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Budget</h1>
      <Card>
        <CardHeader className="flex gap-3">
          <MdAccountBalanceWallet size={24} className="text-primary" />
          <span className="text-lg font-semibold">Categories</span>
        </CardHeader>
        <Divider />
        <CardBody>
          <p className="text-default-500">Your budget categories will appear here.</p>
        </CardBody>
      </Card>
    </div>
  );
}
