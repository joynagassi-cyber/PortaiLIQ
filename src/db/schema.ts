import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

// --- Enums ---
export const itemTypeEnum = pgEnum("item_type", ["text", "file", "email", "phone", "number", "url", "date", "multiple_choice"]);
export const submissionStatusEnum = pgEnum("submission_status", ["pending", "received", "flagged"]);
export const portalStatusEnum = pgEnum("portal_status", ["active", "archived", "completed"]);
export const subscriptionEnum = pgEnum("subscription_status", ["none", "starter", "active", "cancelled"]);
export const taskTypeEnum = pgEnum("ai_task_type", ["completeness_check", "summary", "file_verification"]);
export const aiProviderEnum = pgEnum("ai_provider", ["agnes", "google", "cerebras", "groq"]);
export const aiCallStatusEnum = pgEnum("ai_call_status", ["success", "failed", "timeout"]);
export const activityActionEnum = pgEnum("activity_action", [
  "portal_created", "link_sent", "submission_received",
  "reminder_sent", "file_expired"
]);

// --- Users ---
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique().notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  profession: text("profession"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- Client Profiles ---
export const clientProfiles = pgTable("client_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- Portals ---
export const portals = pgTable("portals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  clientProfileId: uuid("client_profile_id").references(() => clientProfiles.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  status: portalStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- Demand Templates ---
export const demandTemplates = pgTable("demand_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  professionCategory: text("profession_category"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Template Items ---
export const demandTemplateItems = pgTable("demand_template_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id").references(() => demandTemplates.id, { onDelete: "cascade" }).notNull(),
  label: text("label").notNull(),
  description: text("description"),
  itemType: itemTypeEnum("item_type").notNull(),
  expectedFormat: text("expected_format"),
  required: boolean("required").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  choices: text("choices").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Portal Items ---
export const portalItems = pgTable("portal_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  portalId: uuid("portal_id").references(() => portals.id, { onDelete: "cascade" }).notNull(),
  templateItemId: uuid("template_item_id").references(() => demandTemplateItems.id, { onDelete: "set null" }),
  label: text("label").notNull(),
  description: text("description"),
  itemType: itemTypeEnum("item_type").notNull(),
  expectedFormat: text("expected_format"),
  required: boolean("required").default(true).notNull(),
  choices: text("choices").array(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Portal Access Links ---
export const portalAccessLinks = pgTable("portal_access_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  portalId: uuid("portal_id").references(() => portals.id, { onDelete: "cascade" }).notNull(),
  token: text("token").unique().notNull(),
  clientLabel: text("client_label"),
  expiresAt: timestamp("expires_at"),
  reminderSchedule: text("reminder_schedule").default('["3d","7d"]').notNull(),
  remindersEnabled: boolean("reminders_enabled").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Submissions ---
export const submissions = pgTable("submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  portalItemId: uuid("portal_item_id").references(() => portalItems.id, { onDelete: "cascade" }).notNull(),
  portalAccessLinkId: uuid("portal_access_link_id").references(() => portalAccessLinks.id, { onDelete: "cascade" }).notNull(),
  contentText: text("content_text"),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  fileType: text("file_type"),
  status: submissionStatusEnum("status").default("pending").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- AI Summaries ---
export const aiSummaries = pgTable("ai_summaries", {
  id: uuid("id").defaultRandom().primaryKey(),
  portalId: uuid("portal_id").references(() => portals.id, { onDelete: "cascade" }).notNull(),
  summaryText: text("summary_text"),
  providerUsed: aiProviderEnum("provider_used"),
  tokensUsed: integer("tokens_used"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- AI Call Logs ---
export const aiCallLogs = pgTable("ai_call_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  portalId: uuid("portal_id").references(() => portals.id, { onDelete: "set null" }),
  taskType: taskTypeEnum("task_type").notNull(),
  providerAttempted: aiProviderEnum("provider_attempted"),
  providerSuccess: aiProviderEnum("provider_success"),
  status: aiCallStatusEnum("status"),
  errorMessage: text("error_message"),
  tokensInput: integer("tokens_input"),
  tokensOutput: integer("tokens_output"),
  durationMs: integer("duration_ms"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Activity Log ---
export const activityLog = pgTable("activity_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  portalId: uuid("portal_id").references(() => portals.id, { onDelete: "set null" }),
  action: activityActionEnum("action").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Gumroad Licenses ---
export const gumroadLicenseStatusEnum = pgEnum("gumroad_license_status", ["active", "expired", "revoked", "pending"]);

export const gumroadLicenses = pgTable("gumroad_licenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  gumroadLicenseKey: text("gumroad_license_key").unique().notNull(),
  gumroadOrderId: text("gumroad_order_id"),
  productId: text("product_id").notNull(),
  productName: text("product_name"),
  planTier: subscriptionEnum("plan_tier").default("none").notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  verifiedAt: timestamp("verified_at"),
  expiresAt: timestamp("expires_at"),
  status: gumroadLicenseStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
