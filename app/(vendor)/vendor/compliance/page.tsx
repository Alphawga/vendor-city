import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, ExpiryFlag } from "@/lib/status";
import { getComplianceForVendor } from "@/lib/queries";
import { UploadDialog } from "./upload-dialog";

export default async function CompliancePage() {
  const session = await auth();
  const vendorId = session!.user.vendorId;
  if (!vendorId) redirect("/login");

  const items = await getComplianceForVendor(vendorId);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Compliance documents</h1>
        <p className="text-sm text-muted-foreground">
          Upload and track the {items.length} required compliance documents.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Required documents</CardTitle>
          <CardDescription>Upload each document for admin review. Re-upload if rejected or expiring.</CardDescription>
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
              {items.map(({ id, name, submission }) => {
                const status = submission?.status ?? "NOT_SUBMITTED";
                const isResubmit = status === "REJECTED" || status === "APPROVED";
                return (
                  <TableRow key={id}>
                    <TableCell className="font-medium">
                      {name}
                      {status === "REJECTED" && submission?.rejectionReason && (
                        <p className="mt-1 text-xs text-red-600">Rejected: {submission.rejectionReason}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={status} />
                    </TableCell>
                    <TableCell>
                      <ExpiryFlag expiryDate={submission?.expiryDate} />
                    </TableCell>
                    <TableCell>
                      {submission?.fileUrl ? (
                        <a
                          href={submission.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium underline"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <UploadDialog complianceItemId={id} itemName={name} isResubmit={isResubmit} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
