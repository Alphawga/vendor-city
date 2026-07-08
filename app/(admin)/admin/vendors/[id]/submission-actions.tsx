"use client";

import { useState, useTransition } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { reviewSubmission } from "./actions";

export function SubmissionActions({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  function onApprove() {
    startTransition(async () => {
      const res = await reviewSubmission(submissionId, "APPROVED");
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      toast.success("Document approved.");
      router.refresh();
    });
  }

  function onReject() {
    startTransition(async () => {
      const res = await reviewSubmission(submissionId, "REJECTED", reason);
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      toast.success("Document rejected.");
      setOpen(false);
      setReason("");
      router.refresh();
    });
  }

  return (
    <div className="flex justify-end gap-2">
      <Button size="sm" onClick={onApprove} disabled={pending}>
        Approve
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" disabled={pending}>
            Reject
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject document</DialogTitle>
            <DialogDescription>Provide a reason the vendor will see.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor={`reject-${submissionId}`}>Reason</Label>
            <Textarea id={`reject-${submissionId}`} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={onReject} disabled={pending || !reason.trim()}>
              Confirm rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
