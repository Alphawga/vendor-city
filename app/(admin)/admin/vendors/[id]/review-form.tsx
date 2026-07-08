"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { reviewSchema, type ReviewInput } from "@/lib/validations";
import { createReview } from "./actions";

const SCORES = [1, 2, 3, 4, 5];

function ScoreField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value ? String(value) : undefined} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger>
          <SelectValue placeholder="Score" />
        </SelectTrigger>
        <SelectContent>
          {SCORES.map((s) => (
            <SelectItem key={s} value={String(s)}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ReviewForm({ vendorId }: { vendorId: string }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewInput>({ resolver: zodResolver(reviewSchema) });

  const quality = watch("qualityScore");
  const timeliness = watch("timelinessScore");
  const communication = watch("communicationScore");

  async function onSubmit(values: ReviewInput) {
    const res = await createReview(vendorId, values);
    if ("error" in res) {
      toast.error(res.error);
      return;
    }
    toast.success("Performance review saved.");
    reset({ periodLabel: "", comments: "" });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="periodLabel">Period</Label>
        <Input id="periodLabel" placeholder="e.g. Q1 2026" {...register("periodLabel")} />
        {errors.periodLabel && <p className="text-sm text-red-600">{errors.periodLabel.message}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <ScoreField label="Quality" value={quality} onChange={(v) => setValue("qualityScore", v, { shouldValidate: true })} />
        <ScoreField label="Timeliness" value={timeliness} onChange={(v) => setValue("timelinessScore", v, { shouldValidate: true })} />
        <ScoreField label="Communication" value={communication} onChange={(v) => setValue("communicationScore", v, { shouldValidate: true })} />
      </div>
      {(errors.qualityScore || errors.timelinessScore || errors.communicationScore) && (
        <p className="text-sm text-red-600">All three scores (1–5) are required.</p>
      )}
      <div className="space-y-2">
        <Label htmlFor="comments">Comments (optional)</Label>
        <Textarea id="comments" {...register("comments")} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save review"}
      </Button>
    </form>
  );
}
