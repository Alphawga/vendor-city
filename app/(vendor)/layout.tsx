import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";

const NAV: NavItem[] = [
  { href: "/vendor/dashboard", label: "Dashboard" },
  { href: "/vendor/compliance", label: "Compliance" },
  { href: "/vendor/performance", label: "Performance" },
  { href: "/vendor/profile", label: "Profile" },
];

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "VENDOR") redirect("/login");

  return (
    <DashboardShell navItems={NAV} email={session.user.email ?? ""} roleLabel="Vendor portal">
      {children}
    </DashboardShell>
  );
}
