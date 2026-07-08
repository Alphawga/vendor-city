import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function PerformanceLeaderboardPage() {
  const vendors = await db.vendor.findMany({
    include: { performanceReviews: { orderBy: { createdAt: "desc" } } },
  });

  const ranked = vendors
    .map((v) => {
      const reviews = v.performanceReviews;
      const avg = reviews.length
        ? reviews.reduce((sum, r) => sum + r.overallScore, 0) / reviews.length
        : null;
      return {
        id: v.id,
        companyName: v.companyName,
        reviewCount: reviews.length,
        latest: reviews[0]?.overallScore ?? null,
        avg,
      };
    })
    .sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Performance leaderboard</h1>
        <p className="text-sm text-muted-foreground">Vendors ranked by average overall score.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rankings</CardTitle>
          <CardDescription>Highest average performance first.</CardDescription>
        </CardHeader>
        <CardContent>
          {ranked.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No vendors yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Reviews</TableHead>
                  <TableHead>Latest</TableHead>
                  <TableHead>Average</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranked.map((v, i) => (
                  <TableRow key={v.id}>
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/admin/vendors/${v.id}`} className="underline-offset-2 hover:underline">
                        {v.companyName}
                      </Link>
                    </TableCell>
                    <TableCell>{v.reviewCount}</TableCell>
                    <TableCell>{v.latest != null ? v.latest.toFixed(1) : "—"}</TableCell>
                    <TableCell className="font-medium">{v.avg != null ? v.avg.toFixed(1) : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
