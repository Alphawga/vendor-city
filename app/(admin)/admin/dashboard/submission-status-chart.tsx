"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { STATUS_CHART_COLORS } from "@/lib/chart-colors";
import { LABELS } from "@/lib/status";
import type { SubmissionStatus } from "@prisma/client";

export function SubmissionStatusChart({ data }: { data: { status: SubmissionStatus; count: number }[] }) {
  if (data.length === 0) {
    return <p className="py-16 text-center text-sm text-muted-foreground">No data yet.</p>;
  }

  const chartData = data.map((d) => ({ ...d, label: LABELS[d.status] }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {chartData.map((entry) => (
            <Cell key={entry.status} fill={STATUS_CHART_COLORS[entry.status]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
