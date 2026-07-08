import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
]);

/**
 * Single filesystem touchpoint for document storage. Swap this body for
 * S3/Supabase later without changing any caller.
 */
export async function uploadFile(file: File): Promise<string> {
  if (file.size === 0) throw new Error("Empty file.");
  if (file.size > MAX_BYTES) throw new Error("File exceeds 10MB limit.");
  if (!ALLOWED.has(file.type)) throw new Error("Only PDF, PNG, or JPEG files are allowed.");

  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = path.extname(file.name) || ".bin";
  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return `/uploads/${filename}`;
}
