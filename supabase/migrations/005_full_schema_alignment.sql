-- Migration 005: Full schema alignment with PRD
-- Date: 2026-07-21
-- Purpose: Clean up old schema, add new tables, update existing ones

-- Drop old tables that are replaced
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS ai_processing_queue CASCADE;
DROP TABLE IF EXISTS sharing_links CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop old portal_items table and recreate with new schema
DROP TABLE IF EXISTS portal_items CASCADE;

-- Drop old submissions table and recreate with new schema
DROP TABLE IF EXISTS submissions CASCADE;

-- Recreate portal_items with new schema
CREATE TABLE portal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES portals(id) ON DELETE CASCADE,
  template_item_id UUID REFERENCES demand_template_items(id) ON DELETE SET NULL,
  label TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL CHECK (item_type IN ('text', 'file', 'email', 'phone', 'number', 'url', 'date', 'multiple_choice')),
  expected_format TEXT,
  required BOOLEAN DEFAULT true,
  choices TEXT[],
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recreate submissions with new schema
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_item_id UUID NOT NULL REFERENCES portal_items(id) ON DELETE CASCADE,
  portal_access_link_id UUID REFERENCES portal_access_links(id) ON DELETE SET NULL,
  content_text TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'flagged')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing tables if they don't exist
CREATE TABLE IF NOT EXISTS demand_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  profession_category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS demand_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES demand_templates(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL CHECK (item_type IN ('text', 'file', 'email', 'phone', 'number', 'url', 'date', 'multiple_choice')),
  expected_format TEXT,
  required BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  choices TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portal_access_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES portals(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  client_label TEXT,
  expires_at TIMESTAMPTZ,
  reminder_schedule TEXT DEFAULT '["3d","7d"]',
  reminders_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES portals(id) ON DELETE CASCADE,
  summary_text TEXT,
  provider_used TEXT CHECK (provider_used IN ('agnes', 'google', 'cerebras', 'groq')),
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID REFERENCES portals(id) ON DELETE SET NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('completeness_check', 'summary', 'file_verification')),
  provider_attempted TEXT CHECK (provider_attempted IN ('agnes', 'google', 'cerebras', 'groq')),
  provider_success TEXT CHECK (provider_success IN ('agnes', 'google', 'cerebras', 'groq')),
  status TEXT CHECK (status IN ('success', 'failed', 'timeout')),
  error_message TEXT,
  tokens_input INTEGER,
  tokens_output INTEGER,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portal_id UUID REFERENCES portals(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('portal_created', 'link_sent', 'submission_received', 'reminder_sent', 'file_expired')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update portals table
ALTER TABLE portals ADD COLUMN IF NOT EXISTS client_profile_id UUID REFERENCES client_profiles(id) ON DELETE SET NULL;
ALTER TABLE portals ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Update status enum if needed
DO $$
BEGIN
  ALTER TABLE portals ALTER COLUMN status DROP DEFAULT;
  ALTER TABLE portals ALTER COLUMN status DROP CONSTRAINT portals_status_check;
EXCEPTION WHEN undefined_object THEN
  NULL; -- Constraint doesn't exist yet, that's fine
END $$;

ALTER TABLE portals ADD CONSTRAINT portals_status_check
  CHECK (status IN ('active', 'archived', 'completed'));
ALTER TABLE portals ALTER COLUMN status SET DEFAULT 'active';

-- Update gumroad_licenses plan_tier
ALTER TABLE gumroad_licenses ALTER COLUMN plan_tier DROP DEFAULT;
ALTER TABLE gumroad_licenses ALTER COLUMN plan_tier DROP CONSTRAINT IF EXISTS gumroad_licenses_plan_tier_check;

DO $$
BEGIN
  ALTER TABLE gumroad_licenses ALTER COLUMN plan_tier ADD CONSTRAINT gumroad_licenses_plan_tier_check
    CHECK (plan_tier IN ('none', 'starter', 'professional', 'agency'));
  ALTER TABLE gumroad_licenses ALTER COLUMN plan_tier SET DEFAULT 'none';
EXCEPTION WHEN invalid_text_representation THEN
  NULL; -- Constraint might already exist
END $$;

-- Enable RLS on new tables
ALTER TABLE portal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_access_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Owners can view portal_items" ON portal_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = portal_items.portal_id AND portals.user_id = auth.uid())
);
CREATE POLICY "Owners can create portal_items" ON portal_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = portal_items.portal_id AND portals.user_id = auth.uid())
);
CREATE POLICY "Owners can update portal_items" ON portal_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = portal_items.portal_id AND portals.user_id = auth.uid())
);
CREATE POLICY "Owners can delete portal_items" ON portal_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = portal_items.portal_id AND portals.user_id = auth.uid())
);

CREATE POLICY "Anyone can create submissions" ON submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners can view submissions" ON submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = (SELECT portal_id FROM portal_items WHERE portal_items.id = submissions.portal_item_id) AND portals.user_id = auth.uid())
);
CREATE POLICY "Owners can update submissions" ON submissions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = (SELECT portal_id FROM portal_items WHERE portal_items.id = submissions.portal_item_id) AND portals.user_id = auth.uid())
);

CREATE POLICY "Owners can view portal_access_links" ON portal_access_links FOR SELECT USING (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = portal_access_links.portal_id AND portals.user_id = auth.uid())
);
CREATE POLICY "Owners can create portal_access_links" ON portal_access_links FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = portal_access_links.portal_id AND portals.user_id = auth.uid())
);
CREATE POLICY "Owners can update portal_access_links" ON portal_access_links FOR UPDATE USING (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = portal_access_links.portal_id AND portals.user_id = auth.uid())
);
CREATE POLICY "Owners can delete portal_access_links" ON portal_access_links FOR DELETE USING (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = portal_access_links.portal_id AND portals.user_id = auth.uid())
);

CREATE POLICY "Users can view own demand_templates" ON demand_templates FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own demand_templates" ON demand_templates FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own demand_templates" ON demand_templates FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own demand_templates" ON demand_templates FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view own demand_template_items" ON demand_template_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM demand_templates WHERE demand_templates.id = demand_template_items.template_id AND demand_templates.user_id = auth.uid())
);
CREATE POLICY "Users can create own demand_template_items" ON demand_template_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM demand_templates WHERE demand_templates.id = demand_template_items.template_id AND demand_templates.user_id = auth.uid())
);
CREATE POLICY "Users can update own demand_template_items" ON demand_template_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM demand_templates WHERE demand_templates.id = demand_template_items.template_id AND demand_templates.user_id = auth.uid())
);
CREATE POLICY "Users can delete own demand_template_items" ON demand_template_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM demand_templates WHERE demand_templates.id = demand_template_items.template_id AND demand_templates.user_id = auth.uid())
);

CREATE POLICY "Owners can view ai_summaries" ON ai_summaries FOR SELECT USING (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = ai_summaries.portal_id AND portals.user_id = auth.uid())
);
CREATE POLICY "System can manage ai_summaries" ON ai_summaries FOR ALL WITH CHECK (true);

CREATE POLICY "Owners can view ai_call_logs" ON ai_call_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = ai_call_logs.portal_id AND portals.user_id = auth.uid())
);
CREATE POLICY "System can manage ai_call_logs" ON ai_call_logs FOR ALL WITH CHECK (true);

CREATE POLICY "Owners can view activity_log" ON activity_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = activity_log.portal_id AND portals.user_id = auth.uid())
);
CREATE POLICY "System can create activity_log" ON activity_log FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own client_profiles" ON client_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own client_profiles" ON client_profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own client_profiles" ON client_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own client_profiles" ON client_profiles FOR DELETE USING (user_id = auth.uid());

-- Triggers for updated_at
CREATE TRIGGER update_portal_items_updated_at BEFORE UPDATE ON portal_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_profiles_updated_at BEFORE UPDATE ON client_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_portal_items_portal_id ON portal_items(portal_id);
CREATE INDEX IF NOT EXISTS idx_portal_items_template_item_id ON portal_items(template_item_id);
CREATE INDEX IF NOT EXISTS idx_submissions_portal_item_id ON submissions(portal_item_id);
CREATE INDEX IF NOT EXISTS idx_submissions_link_id ON submissions(portal_access_link_id);
CREATE INDEX IF NOT EXISTS idx_portal_access_links_portal_id ON portal_access_links(portal_id);
CREATE INDEX IF NOT EXISTS idx_portal_access_links_token ON portal_access_links(token);
CREATE INDEX IF NOT EXISTS idx_demand_templates_user_id ON demand_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_demand_template_items_template_id ON demand_template_items(template_id);
CREATE INDEX IF NOT EXISTS idx_ai_call_logs_portal_id ON ai_call_logs(portal_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_user_id ON client_profiles(user_id);
