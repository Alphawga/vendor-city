import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role as Role;
        token.vendorId = (user.vendorId as string | null | undefined) ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as Role;
        session.user.vendorId = (token.vendorId as string | null | undefined) ?? null;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const role = auth?.user?.role;
      const { pathname } = nextUrl;
      const onVendor = pathname.startsWith("/vendor");
      const onAdmin = pathname.startsWith("/admin");

      if (!onVendor && !onAdmin) return true;
      if (!role) return false; // triggers redirect to signIn page

      if (onAdmin && role !== "ADMIN") {
        return Response.redirect(new URL("/vendor/dashboard", nextUrl));
      }
      if (onVendor && role !== "VENDOR") {
        return Response.redirect(new URL("/admin/dashboard", nextUrl));
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
