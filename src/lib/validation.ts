import { z } from "zod";

// --- Portal Schemas ---
export const createPortalSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  clientProfileId: z.string().uuid().optional(),
});

export const updatePortalSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["active", "archived", "completed"]).optional(),
});

// --- Item Schemas ---
export const createItemSchema = z.object({
  label: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  itemType: z.enum(['text', 'file', 'email', 'phone', 'number', 'url', 'date', 'multiple_choice']),
  expectedFormat: z.string().max(50).optional(),
  required: z.boolean().default(true),
  choices: z.array(z.string()).optional(),
  sortOrder: z.number().int().min(0).default(0),
});

// --- Template Schemas ---
export const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  professionCategory: z.string().max(50).optional(),
  items: z.array(createItemSchema),
});

// --- Link Schemas ---
export const createLinkSchema = z.object({
  portalId: z.string().uuid(),
  clientLabel: z.string().max(100).optional(),
  expiresAt: z.string().datetime().optional(),
  reminderSchedule: z.array(z.string()).default(["3d", "7d"]),
  remindersEnabled: z.boolean().default(true),
});

// --- Submission Schemas ---
export const submissionItemSchema = z.object({
  portalItemId: z.string().uuid(),
  contentText: z.string().max(10000).optional(),
  fileUrl: z.string().url().optional(),
  fileName: z.string().max(255).optional(),
  fileSize: z.number().int().positive().optional(),
  fileType: z.string().max(50).optional(),
});

export const submitPortalSchema = z.object({
  portalToken: z.string().min(1),
  linkToken: z.string().uuid().optional(),
  clientName: z.string().max(100).optional(),
  clientEmail: z.string().email().optional(),
  answers: z.record(z.union([z.string(), submissionItemSchema])).min(1),
});

// --- Upload Schemas ---
export const presignUploadSchema = z.object({
  fileName: z.string().max(255),
  fileType: z.string().max(50),
  portalItemId: z.string().uuid(),
  expectedFormat: z.string().max(50).optional(),
});

export const completeUploadSchema = z.object({
  key: z.string().min(1),
  portalItemId: z.string().uuid(),
  fileName: z.string().max(255),
  fileSize: z.number().int().positive().max(10 * 1024 * 1024),
  fileType: z.string().max(50),
});

// --- Gumroad Schemas ---
export const verifyLicenseSchema = z.object({
  licenseKey: z.string().min(1),
  productId: z.string().min(1),
  userId: z.string().uuid().optional(),
});

export const gumroadWebhookSchema = z.object({
  action_name: z.enum(['purchase', 'refunded', 'dispute_needed', 'dispute_started']),
  email: z.string().email().optional(),
  license_key: z.string().optional(),
  product_id: z.string().optional(),
  product_name: z.string().optional(),
}).strict();

// --- Zod Types ---
export type CreatePortalInput = z.infer<typeof createPortalSchema>;
export type UpdatePortalInput = z.infer<typeof updatePortalSchema>;
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type SubmitPortalInput = z.infer<typeof submitPortalSchema>;
export type PresignUploadInput = z.infer<typeof presignUploadSchema>;
export type CompleteUploadInput = z.infer<typeof completeUploadSchema>;
export type VerifyLicenseInput = z.infer<typeof verifyLicenseSchema>;
export type GumroadWebhookInput = z.infer<typeof gumroadWebhookSchema>;
