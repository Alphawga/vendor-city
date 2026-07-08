"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { completionPct } from "@/lib/queries";

export function ComplianceCompletionChart({
  data,
}: {
  data: { name: string; approvedCount: number; totalVendors: number }[];
}) {
  if (data.length === 0 || data[0].totalVendors === 0) {
    return <p className="py-16 text-center text-sm text-muted-foreground">No data yet.</p>;
  }

  const chartData = data.map((d) => ({
    name: d.name,
    pct: completionPct(d.approvedCount, d.totalVendors),
  }));

  return (
    <ResponsiveContainer width="100%" height={340}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} fontSize={12} tickLine={false} axisLine={false} unit="%" />
        <YAxis type="category" dataKey="name" width={220} fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip formatter={(value) => [`${value}%`, "Approved"]} />
        <Bar dataKey="pct" radius={[0, 4, 4, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  );
}
