import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge, ExpiryFlag } from "@/lib/status";
import { getComplianceForVendor } from "@/lib/queries";
import { OnboardingActions } from "./onboarding-actions";
import { SubmissionActions } from "./submission-actions";
import { ReviewForm } from "./review-form";

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const vendor = await db.vendor.findUnique({
    where: { id },
    include: {
      user: { select: { email: true } },
      performanceReviews: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!vendor) notFound();

  const items = await getComplianceForVendor(id);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button asChild variant="link" className="h-auto p-0 text-muted-foreground">
            <Link href="/admin/vendors">← Back to vendors</Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">{vendor.companyName}</h1>
        </div>
        <StatusBadge status={vendor.onboardingStatus} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <div><span className="text-muted-foreground">Contact:</span> {vendor.contactName}</div>
          <div><span className="text-muted-foreground">Email:</span> {vendor.user.email}</div>
          <div><span className="text-muted-foreground">Phone:</span> {vendor.phone}</div>
          <div><span className="text-muted-foreground">Address:</span> {vendor.address ?? "—"}</div>
          {vendor.onboardingStatus === "REJECTED" && vendor.rejectionReason && (
            <div className="sm:col-span-2 text-red-600">Rejection reason: {vendor.rejectionReason}</div>
          )}
        </CardContent>
      </Card>

      {vendor.onboardingStatus === "PENDING" && (
        <Card>
          <CardHeader>
            <CardTitle>Onboarding approval</CardTitle>
            <CardDescription>Approve or reject this vendor&apos;s onboarding.</CardDescription>
          </CardHeader>
          <CardContent>
            <OnboardingActions vendorId={vendor.id} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Compliance submissions</CardTitle>
          <CardDescription>Review uploaded documents.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>File</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(({ id: itemId, name, submission }) => (
                <TableRow key={itemId}>
                  <TableCell className="font-medium">
                    {name}
                    {submission?.status === "REJECTED" && submission.rejectionReason && (
                      <p className="mt-1 text-xs text-red-600">Rejected: {submission.rejectionReason}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={submission?.status ?? "NOT_SUBMITTED"} />
                  </TableCell>
                  <TableCell>
                    <ExpiryFlag expiryDate={submission?.expiryDate} />
                  </TableCell>
                  <TableCell>
                    {submission?.fileUrl ? (
                      <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium underline">
                        View
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {submission?.status === "PENDING_REVIEW" ? (
                      <SubmissionActions submissionId={submission.id} />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New performance review</CardTitle>
            <CardDescription>Overall score is the average of the three scores.</CardDescription>
          </CardHeader>
          <CardContent>
            <ReviewForm vendorId={vendor.id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review history</CardTitle>
          </CardHeader>
          <CardContent>
            {vendor.performanceReviews.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No reviews yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Q</TableHead>
                    <TableHead>T</TableHead>
                    <TableHead>C</TableHead>
                    <TableHead>Overall</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendor.performanceReviews.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.periodLabel}</TableCell>
                      <TableCell>{r.qualityScore}</TableCell>
                      <TableCell>{r.timelinessScore}</TableCell>
                      <TableCell>{r.communicationScore}</TableCell>
                      <TableCell className="font-medium">{r.overallScore.toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
