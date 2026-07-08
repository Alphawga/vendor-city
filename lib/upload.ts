import { randomUUID } from "crypto";
import { Readable } from "stream";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

cloudinary.config({ secure: true });

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
]);

/**
 * Single upload touchpoint for document storage (Cloudinary).
 */
export async function uploadFile(file: File): Promise<string> {
  if (file.size === 0) throw new Error("Empty file.");
  if (file.size > MAX_BYTES) throw new Error("File exceeds 10MB limit.");
  if (!ALLOWED.has(file.type)) throw new Error("Only PDF, PNG, or JPEG files are allowed.");

  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "vendor-city/compliance",
        public_id: randomUUID(),
        resource_type: "auto",
      },
      (error, uploaded) => {
        if (error || !uploaded) {
          reject(error instanceof Error ? error : new Error("Cloudinary upload failed."));
          return;
        }
        resolve(uploaded);
      },
    );
    Readable.from(buffer).pipe(stream);
  });

  return result.secure_url;
}
