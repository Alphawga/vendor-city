import { PrismaClient, Role, OnboardingStatus, SubmissionStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { COMPLIANCE_ITEMS } from "../lib/compliance-items";

const db = new PrismaClient();

const SAMPLE_PDF_URL = "https://pdfobject.com/pdf/sample.pdf";
const SAMPLE_IMAGE_URL = "https://placehold.co/800x1000.png?text=Sample+Document";

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function main() {
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  await db.user.upsert({
    where: { email: "admin@vendorcity.com" },
    update: { password: adminPassword, role: Role.ADMIN },
    create: {
      email: "admin@vendorcity.com",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const vendorPassword = await bcrypt.hash("Vendor123!", 10);
  const vendorUser = await db.user.upsert({
    where: { email: "vendor@vendorcity.com" },
    update: { password: vendorPassword, role: Role.VENDOR },
    create: {
      email: "vendor@vendorcity.com",
      password: vendorPassword,
      role: Role.VENDOR,
    },
  });

  const vendor = await db.vendor.upsert({
    where: { userId: vendorUser.id },
    update: { onboardingStatus: OnboardingStatus.APPROVED },
    create: {
      userId: vendorUser.id,
      companyName: "Acme Supplies Ltd",
      contactName: "Sample Vendor",
      phone: "+2348000000000",
      address: "1 Marina Road, Lagos",
      onboardingStatus: OnboardingStatus.APPROVED,
    },
  });

  const itemsByName = new Map<string, string>();
  for (const item of COMPLIANCE_ITEMS) {
    const created = await db.complianceItem.upsert({
      where: { name: item.name },
      update: { description: item.description },
      create: { name: item.name, description: item.description },
    });
    itemsByName.set(item.name, created.id);
  }

  const sampleSubmissions: {
    itemName: string;
    status: SubmissionStatus;
    fileUrl: string;
    submittedAt: Date;
    reviewedAt?: Date;
    rejectionReason?: string;
    expiryDate?: Date;
  }[] = [
    {
      itemName: "CAC Certificate (Certificate of Incorporation)",
      status: SubmissionStatus.APPROVED,
      fileUrl: SAMPLE_PDF_URL,
      submittedAt: daysFromNow(-30),
      reviewedAt: daysFromNow(-25),
    },
    {
      itemName: "Tax Clearance Certificate",
      status: SubmissionStatus.APPROVED,
      fileUrl: SAMPLE_PDF_URL,
      submittedAt: daysFromNow(-40),
      reviewedAt: daysFromNow(-35),
      expiryDate: daysFromNow(20), // within 30 days -> amber "soon" flag
    },
    {
      itemName: "VAT Registration Certificate",
      status: SubmissionStatus.PENDING_REVIEW,
      fileUrl: SAMPLE_IMAGE_URL,
      submittedAt: daysFromNow(-2),
    },
    {
      itemName: "Insurance Certificate (Liability/Indemnity)",
      status: SubmissionStatus.REJECTED,
      fileUrl: SAMPLE_IMAGE_URL,
      submittedAt: daysFromNow(-5),
      reviewedAt: daysFromNow(-1),
      rejectionReason: "Certificate has expired — please upload a current one.",
    },
    {
      itemName: "NCDMB / Industry Certification",
      status: SubmissionStatus.APPROVED,
      fileUrl: SAMPLE_PDF_URL,
      submittedAt: daysFromNow(-100),
      reviewedAt: daysFromNow(-95),
      expiryDate: daysFromNow(-10), // past -> red "expired" flag
    },
    {
      itemName: "Bank Reference Letter",
      status: SubmissionStatus.PENDING_REVIEW,
      fileUrl: SAMPLE_PDF_URL,
      submittedAt: daysFromNow(-1),
    },
    {
      itemName: "Health & Safety Policy",
      status: SubmissionStatus.APPROVED,
      fileUrl: SAMPLE_IMAGE_URL,
      submittedAt: daysFromNow(-15),
      reviewedAt: daysFromNow(-12),
    },
    {
      itemName: "Proof of Business Address",
      status: SubmissionStatus.REJECTED,
      fileUrl: SAMPLE_IMAGE_URL,
      submittedAt: daysFromNow(-6),
      reviewedAt: daysFromNow(-4),
      rejectionReason: "Utility bill is older than 3 months.",
    },
    // "Company Profile Document" and "ISO Certification (Quality Management)"
    // are left NOT_SUBMITTED so the vendor upload flow still has items to test.
  ];

  for (const sub of sampleSubmissions) {
    const complianceItemId = itemsByName.get(sub.itemName);
    if (!complianceItemId) throw new Error(`Unknown compliance item: ${sub.itemName}`);

    await db.complianceSubmission.upsert({
      where: { vendorId_complianceItemId: { vendorId: vendor.id, complianceItemId } },
      update: {
        status: sub.status,
        fileUrl: sub.fileUrl,
        submittedAt: sub.submittedAt,
        reviewedAt: sub.reviewedAt ?? null,
        rejectionReason: sub.rejectionReason ?? null,
        expiryDate: sub.expiryDate ?? null,
      },
      create: {
        vendorId: vendor.id,
        complianceItemId,
        status: sub.status,
        fileUrl: sub.fileUrl,
        submittedAt: sub.submittedAt,
        reviewedAt: sub.reviewedAt ?? null,
        rejectionReason: sub.rejectionReason ?? null,
        expiryDate: sub.expiryDate ?? null,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
