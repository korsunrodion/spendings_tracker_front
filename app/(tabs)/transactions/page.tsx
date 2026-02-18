"use client";

import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { MdReceiptLong } from "react-icons/md";

export default function TransactionsPage() {
  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Transactions</h1>
      <Card>
        <CardHeader className="flex gap-3">
          <MdReceiptLong size={24} className="text-primary" />
          <span className="text-lg font-semibold">Recent</span>
        </CardHeader>
        <Divider />
        <CardBody>
          <p className="text-default-500">Your transactions will appear here.</p>
        </CardBody>
      </Card>
    </div>
  );
}
