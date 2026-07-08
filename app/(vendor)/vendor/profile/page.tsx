import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const session = await auth();
  const vendorId = session!.user.vendorId;
  if (!vendorId) redirect("/login");

  const vendor = await db.vendor.findUnique({
    where: { id: vendorId },
    include: { user: { select: { email: true } } },
  });
  if (!vendor) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Company profile</h1>
        <p className="text-sm text-muted-foreground">Manage your company details.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Your email is used to sign in and cannot be changed.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            email={vendor.user.email}
            defaults={{
              companyName: vendor.companyName,
              contactName: vendor.contactName,
              phone: vendor.phone,
              address: vendor.address ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
