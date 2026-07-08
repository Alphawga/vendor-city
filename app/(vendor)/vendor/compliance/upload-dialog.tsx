"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UploadDialog({
  complianceItemId,
  itemName,
  isResubmit,
}: {
  complianceItemId: string;
  itemName: string;
  isResubmit: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("complianceItemId", complianceItemId);

    setSubmitting(true);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Upload failed.");
      return;
    }
    toast.success("Document submitted for review.");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={isResubmit ? "default" : "outline"}>
          {isResubmit ? "Re-upload" : "Upload"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Upload document</DialogTitle>
            <DialogDescription>{itemName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor={`file-${complianceItemId}`}>File (PDF, PNG, or JPEG)</Label>
              <Input
                id={`file-${complianceItemId}`}
                name="file"
                type="file"
                accept="application/pdf,image/png,image/jpeg"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`expiry-${complianceItemId}`}>Expiry date (optional)</Label>
              <Input id={`expiry-${complianceItemId}`} name="expiryDate" type="date" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Uploading…" : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
