import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/lib/status";
import { complianceStats, completionPct, getComplianceForVendor, TOTAL_ITEMS } from "@/lib/queries";

export default async function VendorDashboard() {
  const session = await auth();
  const vendorId = session!.user.vendorId;
  if (!vendorId) redirect("/login");

  const vendor = await db.vendor.findUnique({
    where: { id: vendorId },
    include: {
      performanceReviews: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!vendor) redirect("/login");

  const items = await getComplianceForVendor(vendorId);
  const stats = complianceStats(items);
  const latestReview = vendor.performanceReviews[0];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome, {vendor.companyName}</h1>
        <p className="text-sm text-muted-foreground">Your onboarding and compliance overview.</p>
      </div>

      {vendor.onboardingStatus === "PENDING" && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Your onboarding is pending admin approval. You can still upload compliance documents while you wait.
        </div>
      )}
      {vendor.onboardingStatus === "REJECTED" && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Your onboarding was rejected.
          {vendor.rejectionReason ? ` Reason: ${vendor.rejectionReason}` : ""}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Onboarding status</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusBadge status={vendor.onboardingStatus} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Compliance</CardDescription>
            <CardTitle className="text-2xl">
              {stats.approved} / {TOTAL_ITEMS}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {completionPct(stats.approved, TOTAL_ITEMS)}% approved · {stats.pending} pending · {stats.expired} expired
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Latest performance</CardDescription>
            <CardTitle className="text-2xl">
              {latestReview ? `${latestReview.overallScore.toFixed(1)} / 5` : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {latestReview ? latestReview.periodLabel : "No reviews yet"}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button asChild>
          <Link href="/vendor/compliance">Manage compliance documents</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/vendor/performance">View performance</Link>
        </Button>
      </div>
    </div>
  );
}
