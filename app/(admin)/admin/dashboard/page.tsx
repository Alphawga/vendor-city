import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboard() {
  const [totalVendors, pendingOnboarding, pendingDocs, avg, awaitingApproval, awaitingReview] = await Promise.all([
    db.vendor.count(),
    db.vendor.count({ where: { onboardingStatus: "PENDING" } }),
    db.complianceSubmission.count({ where: { status: "PENDING_REVIEW" } }),
    db.performanceReview.aggregate({ _avg: { overallScore: true } }),
    db.vendor.findMany({
      where: { onboardingStatus: "PENDING" },
      orderBy: { createdAt: "asc" },
      take: 5,
      select: { id: true, companyName: true },
    }),
    db.complianceSubmission.findMany({
      where: { status: "PENDING_REVIEW" },
      orderBy: { submittedAt: "asc" },
      take: 5,
      select: {
        id: true,
        vendor: { select: { id: true, companyName: true } },
        complianceItem: { select: { name: true } },
      },
    }),
  ]);

  const avgScore = avg._avg.overallScore;

  const stats = [
    { label: "Total vendors", value: totalVendors },
    { label: "Pending onboarding", value: pendingOnboarding },
    { label: "Documents to review", value: pendingDocs },
    { label: "Avg performance", value: avgScore != null ? `${avgScore.toFixed(1)} / 5` : "—" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of vendor onboarding and compliance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardDescription>{s.label}</CardDescription>
              <CardTitle className="text-3xl">{s.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vendors awaiting approval</CardTitle>
            <CardDescription>
              <Link href="/admin/vendors?status=PENDING" className="underline">View all</Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {awaitingApproval.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Nothing pending.</p>
            ) : (
              awaitingApproval.map((v) => (
                <Link
                  key={v.id}
                  href={`/admin/vendors/${v.id}`}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-muted"
                >
                  <span className="font-medium">{v.companyName}</span>
                  <span className="text-muted-foreground">Review →</span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents awaiting review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {awaitingReview.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Nothing pending.</p>
            ) : (
              awaitingReview.map((s) => (
                <Link
                  key={s.id}
                  href={`/admin/vendors/${s.vendor.id}`}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-muted"
                >
                  <span>
                    <span className="font-medium">{s.vendor.companyName}</span>
                    <span className="text-muted-foreground"> · {s.complianceItem.name}</span>
                  </span>
                  <span className="text-muted-foreground">Review →</span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
