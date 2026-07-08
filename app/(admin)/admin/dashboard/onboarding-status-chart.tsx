"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { STATUS_CHART_COLORS } from "@/lib/chart-colors";
import { LABELS } from "@/lib/status";
import type { OnboardingStatus } from "@prisma/client";

export function OnboardingStatusChart({ data }: { data: { status: OnboardingStatus; count: number }[] }) {
  if (data.length === 0) {
    return <p className="py-16 text-center text-sm text-muted-foreground">No data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="status" innerRadius={55} outerRadius={85} paddingAngle={2}>
          {data.map((entry) => (
            <Cell key={entry.status} fill={STATUS_CHART_COLORS[entry.status]} />
          ))}
        </Pie>
        <Tooltip formatter={(value, _name, item) => [value, LABELS[item.payload.status as OnboardingStatus]]} />
        <Legend formatter={(value) => LABELS[value as OnboardingStatus]} />
      </PieChart>
    </ResponsiveContainer>
  );
}
