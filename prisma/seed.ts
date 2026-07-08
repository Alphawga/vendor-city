import { PrismaClient, Role, OnboardingStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { COMPLIANCE_ITEMS } from "../lib/compliance-items";

const db = new PrismaClient();

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

  await db.vendor.upsert({
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

  for (const item of COMPLIANCE_ITEMS) {
    await db.complianceItem.upsert({
      where: { name: item.name },
      update: { description: item.description },
      create: { name: item.name, description: item.description },
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
