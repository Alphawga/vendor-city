import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: Role;
    vendorId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      vendorId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    vendorId: string | null;
  }
}
