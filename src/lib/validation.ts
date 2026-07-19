import { z } from "zod";

// --- Auth Schemas ---
export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(50),
  profession: z.enum(["designer", "developer", "consultant", "coach", "photographer", "other"]).optional(),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// --- Portal Schemas ---
export const createPortalSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  clientProfileId: z.string().uuid().optional(),
});

export const updatePortalSchema = z.object({
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
  sortOrder: z.number().int().default(0),
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
export const submitTextSchema = z.object({
  portalItemId: z.string().uuid(),
  portalAccessLinkId: z.string().uuid(),
  contentText: z.string().max(10000),
});

export const submitFileSchema = z.object({
  portalItemId: z.string().uuid(),
  portalAccessLinkId: z.string().uuid(),
  fileName: z.string().max(255),
  fileSize: z.number().int().positive(),
  fileType: z.string().max(50),
});

// --- Reminder Schema ---
export const sendReminderSchema = z.object({
  portalAccessLinkId: z.string().uuid(),
});

// --- Gumroad License Schema ---
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

// --- Zod Validators for API Routes ---
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type CreatePortalInput = z.infer<typeof createPortalSchema>;
export type UpdatePortalInput = z.infer<typeof updatePortalSchema>;
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type SubmitTextInput = z.infer<typeof submitTextSchema>;
export type SubmitFileInput = z.infer<typeof submitFileSchema>;
export type SendReminderInput = z.infer<typeof sendReminderSchema>;
export type VerifyLicenseInput = z.infer<typeof verifyLicenseSchema>;
export type GumroadWebhookInput = z.infer<typeof gumroadWebhookSchema>;
