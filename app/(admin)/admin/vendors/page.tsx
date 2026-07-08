import Link from "next/link";
import type { OnboardingStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/lib/status";
import { completionPct, TOTAL_ITEMS } from "@/lib/queries";
import { FilterBar } from "./filter-bar";

const VALID_STATUSES: OnboardingStatus[] = ["PENDING", "APPROVED", "REJECTED"];

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;

  const where: Prisma.VendorWhereInput = {};
  if (q) where.companyName = { contains: q, mode: "insensitive" };
  if (status && VALID_STATUSES.includes(status as OnboardingStatus)) {
    where.onboardingStatus = status as OnboardingStatus;
  }

  const vendors = await db.vendor.findMany({
    where,
    include: {
      submissions: { where: { status: "APPROVED" }, select: { id: true } },
      performanceReviews: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vendors</h1>
        <p className="text-sm text-muted-foreground">{vendors.length} vendor(s).</p>
      </div>

      <FilterBar />

      <Card>
        <CardHeader>
          <CardTitle>All vendors</CardTitle>
        </CardHeader>
        <CardContent>
          {vendors.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No vendors match your filters.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Onboarding</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Latest score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((v) => {
                  const latest = v.performanceReviews[0];
                  return (
                    <TableRow key={v.id} className="cursor-pointer">
                      <TableCell className="font-medium">
                        <Link href={`/admin/vendors/${v.id}`} className="block">
                          {v.companyName}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={v.onboardingStatus} />
                      </TableCell>
                      <TableCell>{completionPct(v.submissions.length, TOTAL_ITEMS)}%</TableCell>
                      <TableCell>{latest ? `${latest.overallScore.toFixed(1)} / 5` : "—"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
