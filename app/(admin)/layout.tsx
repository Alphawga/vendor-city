import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";

const NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/vendors", label: "Vendors" },
  { href: "/admin/performance", label: "Performance" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  return (
    <DashboardShell navItems={NAV} email={session.user.email ?? ""} roleLabel="Admin portal">
      {children}
    </DashboardShell>
  );
}
