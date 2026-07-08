import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadFile } from "@/lib/upload";

export async function POST(req: Request) {
  const session = await auth();
  const vendorId = session?.user?.vendorId;
  if (!session?.user || session.user.role !== "VENDOR" || !vendorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const complianceItemId = form.get("complianceItemId");
  const expiryRaw = form.get("expiryDate");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (typeof complianceItemId !== "string" || !complianceItemId) {
    return NextResponse.json({ error: "Missing compliance item." }, { status: 400 });
  }

  const item = await db.complianceItem.findUnique({ where: { id: complianceItemId }, select: { id: true } });
  if (!item) {
    return NextResponse.json({ error: "Unknown compliance item." }, { status: 400 });
  }

  const expiryDate = typeof expiryRaw === "string" && expiryRaw ? new Date(expiryRaw) : null;

  let fileUrl: string;
  try {
    fileUrl = await uploadFile(file);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed." }, { status: 400 });
  }

  await db.complianceSubmission.upsert({
    where: { vendorId_complianceItemId: { vendorId, complianceItemId } },
    update: {
      fileUrl,
      expiryDate,
      status: "PENDING_REVIEW",
      submittedAt: new Date(),
      reviewedAt: null,
      rejectionReason: null,
    },
    create: {
      vendorId,
      complianceItemId,
      fileUrl,
      expiryDate,
      status: "PENDING_REVIEW",
      submittedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
