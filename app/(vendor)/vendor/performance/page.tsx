import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PerformanceChart } from "./performance-chart";

export default async function VendorPerformancePage() {
  const session = await auth();
  const vendorId = session!.user.vendorId;
  if (!vendorId) redirect("/login");

  const reviews = await db.performanceReview.findMany({
    where: { vendorId },
    orderBy: { createdAt: "asc" },
  });

  const chartData = reviews.map((r) => ({ period: r.periodLabel, score: r.overallScore }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Performance</h1>
        <p className="text-sm text-muted-foreground">Your performance reviews and score trend.</p>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No performance reviews yet. Once an admin reviews your performance, results will appear here.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Overall score trend</CardTitle>
              <CardDescription>Average of quality, timeliness, and communication (out of 5).</CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceChart data={chartData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Review history</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Timeliness</TableHead>
                    <TableHead>Communication</TableHead>
                    <TableHead>Overall</TableHead>
                    <TableHead>Comments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...reviews].reverse().map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.periodLabel}</TableCell>
                      <TableCell>{r.qualityScore}</TableCell>
                      <TableCell>{r.timelinessScore}</TableCell>
                      <TableCell>{r.communicationScore}</TableCell>
                      <TableCell className="font-medium">{r.overallScore.toFixed(1)}</TableCell>
                      <TableCell className="max-w-xs text-muted-foreground">{r.comments ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
