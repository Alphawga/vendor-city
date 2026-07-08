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
import { approveOnboarding, rejectOnboarding } from "./actions";

export function OnboardingActions({ vendorId }: { vendorId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  function onApprove() {
    startTransition(async () => {
      const res = await approveOnboarding(vendorId);
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      toast.success("Vendor approved.");
      router.refresh();
    });
  }

  function onReject() {
    startTransition(async () => {
      const res = await rejectOnboarding(vendorId, reason);
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      toast.success("Vendor onboarding rejected.");
      setOpen(false);
      setReason("");
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <Button onClick={onApprove} disabled={pending}>
        Approve
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" disabled={pending}>
            Reject
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject onboarding</DialogTitle>
            <DialogDescription>Provide a reason the vendor will see.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="reject-reason">Reason</Label>
            <Textarea id="reject-reason" value={reason} onChange={(e) => setReason(e.target.value)} />
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
