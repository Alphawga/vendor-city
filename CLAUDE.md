# Vendor City — Project Instructions

Vendor compliance, approval, and performance management app (v1/MVP). Global standards in `~/.claude/CLAUDE.md` apply; this file is project-specific.

## Tech Stack
- Next.js 16 (App Router, TypeScript) + React 19
- Tailwind CSS v4 + shadcn/ui (neutral theme, radix base)
- Prisma ORM + PostgreSQL
- Auth.js v5 (`next-auth@beta`), Credentials provider, JWT sessions
- react-hook-form + zod
- recharts (performance trend), sonner (toasts)
- bcryptjs for password hashing

## Commands
- `pnpm dev` — dev server
- `pnpm build` / `npx tsc --noEmit` — verify
- `pnpm prisma migrate dev` — apply schema changes
- `pnpm db:seed` — seed admin/vendor/compliance items
- DB: local `postgresql@16` (Homebrew). `DATABASE_URL` in `.env`.

## Seed Credentials
- Admin: `admin@vendorcity.com` / `Admin123!`
- Vendor (approved): `vendor@vendorcity.com` / `Vendor123!`

## Data Model
Enums: `Role` (VENDOR/ADMIN), `OnboardingStatus` (PENDING/APPROVED/REJECTED), `SubmissionStatus` (NOT_SUBMITTED/PENDING_REVIEW/APPROVED/REJECTED).
Models: `User` → `Vendor` (1:1) → `ComplianceSubmission` / `PerformanceReview`. `ComplianceItem` is a fixed seeded list of 6. `PerformanceReview.overallScore` = average of the three 1–5 scores, computed on submit.

## Migration Rules
- Schema changes go through `prisma migrate dev` — never `db push` against a real DB without confirmation.
- Never run `migrate reset` / `DROP` without explicit user confirmation.

## Module Map
- `lib/db.ts` — Prisma singleton (`db`).
- `lib/auth.ts` — full Auth.js config (Node runtime, bcrypt). `lib/auth.config.ts` — edge-safe config for `proxy.ts` (Next 16 renamed `middleware` → `proxy`).
- `lib/upload.ts` — `uploadFile(file)` helper, the ONLY filesystem touchpoint (swap for S3 later).
- `lib/validations.ts` — zod schemas. `lib/compliance-items.ts` — fixed seed list.
- `lib/status.tsx` — `StatusBadge` mapping + expiry helpers.
- Route groups: `app/(auth)`, `app/(vendor)`, `app/(admin)`. Each `(vendor)`/`(admin)` group has its own sidebar layout.
- Mutations are Server Actions colocated as `actions.ts` per feature; they re-check session/role server-side and `revalidatePath`. File upload is `app/api/upload/route.ts`.

## Status Badge Colors
PENDING / PENDING_REVIEW → amber · APPROVED → green · REJECTED → red · NOT_SUBMITTED → gray.
Expiry flags: within 30 days → amber, past → red.

## v1 Guardrails
Intentionally minimal. Do NOT add: notifications, email, multi-tenancy, multi-step onboarding wizards, admin-configurable checklists, or permission systems beyond the two roles. Document submission is allowed while onboarding is PENDING.
