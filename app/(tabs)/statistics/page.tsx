"use client";

import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { MdBarChart } from "react-icons/md";

export default function StatisticsPage() {
  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Statistics</h1>
      <Card>
        <CardHeader className="flex gap-3">
          <MdBarChart size={24} className="text-primary" />
          <span className="text-lg font-semibold">Overview</span>
        </CardHeader>
        <Divider />
        <CardBody>
          <p className="text-default-500">Spending statistics will appear here.</p>
        </CardBody>
      </Card>
    </div>
  );
}
