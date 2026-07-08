import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  companyName: z.string().min(1, "Company name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().optional(),
});

export const profileSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().optional(),
});

export const reviewSchema = z.object({
  periodLabel: z.string().min(1, "Period is required"),
  qualityScore: z.coerce.number().int().min(1).max(5),
  timelinessScore: z.coerce.number().int().min(1).max(5),
  communicationScore: z.coerce.number().int().min(1).max(5),
  comments: z.string().optional(),
});

export const rejectionSchema = z.object({
  reason: z.string().min(1, "A reason is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
