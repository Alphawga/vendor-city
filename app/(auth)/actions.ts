"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";
import { db } from "@/lib/db";
import { loginSchema, registerSchema } from "@/lib/validations";

export type ActionResult = { error: string } | { ok: true; role: "ADMIN" | "VENDOR" };

export async function login(values: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid email or password." };

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { role: true },
  });

  try {
    await signIn("credentials", { ...parsed.data, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) return { error: "Invalid email or password." };
    throw error;
  }

  return { ok: true, role: user?.role ?? "VENDOR" };
}

export async function register(values: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) return { error: "Please check the form and try again." };

  const { email, password, companyName, contactName, phone, address } = parsed.data;

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return { error: "An account with this email already exists." };

  const hashed = await bcrypt.hash(password, 10);
  await db.user.create({
    data: {
      email,
      password: hashed,
      role: "VENDOR",
      vendor: {
        create: { companyName, contactName, phone, address },
      },
    },
  });

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) return { error: "Account created, but sign-in failed. Please log in." };
    throw error;
  }

  return { ok: true, role: "VENDOR" };
}
