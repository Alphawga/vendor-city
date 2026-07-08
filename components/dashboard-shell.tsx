"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth-actions";

export type NavItem = { href: string; label: string };

export function DashboardShell({
  navItems,
  email,
  roleLabel,
  children,
}: {
  navItems: NavItem[];
  email: string;
  roleLabel: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-svh w-full">
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-muted/30 md:flex">
        <div className="border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="size-5 shrink-0" aria-hidden="true">
              <rect width="24" height="24" rx="6" className="fill-primary" />
              <path d="M7 12.5l3 3 7-7" stroke="var(--primary-foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <p className="text-lg font-bold tracking-tight">Vendor City</p>
          </div>
          <p className="text-xs text-muted-foreground">{roleLabel}</p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b px-6 py-3">
          <nav className="flex flex-wrap gap-2 md:hidden">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
            <form action={logout}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut className="size-4" />
                Logout
              </Button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
