-- Migration: Update schema to match PRD requirements

-- Drop old sharing_links table (will recreate as portal_access_links)
DROP TABLE IF EXISTS sharing_links CASCADE;

-- Drop old portal_items table and recreate with new schema
DROP TABLE IF EXISTS portal_items CASCADE;

-- Drop old submissions table and recreate with new schema  
DROP TABLE IF EXISTS submissions CASCADE;

-- Drop old files table (we'll use blob storage instead)
DROP TABLE IF EXISTS files CASCADE;

-- Drop old notifications table (we'll use Brevo API)
DROP TABLE IF EXISTS notifications CASCADE;

-- Drop old audit_logs table (we'll use activity_log)
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Drop old ai_processing_queue table (we'll use ai_call_logs)
DROP TABLE IF EXISTS ai_processing_queue CASCADE;

-- Recreate portal_items with new schema
CREATE TABLE portal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES portals(id) ON DELETE CASCADE,
  template_item_id UUID REFERENCES demand_template_items(id) ON DELETE SET NULL,
  label TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL CHECK (item_type IN ('text', 'file', 'multiple_choice', 'date', 'number')),
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
  portal_access_link_id UUID NOT NULL REFERENCES portal_access_links(id) ON DELETE CASCADE,
  content_text TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'flagged')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create portal_access_links table (replaces sharing_links)
CREATE TABLE portal_access_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES portals(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  client_label TEXT,
  expires_at TIMESTAMPTZ,
  reminder_schedule TEXT DEFAULT '["3d","7d"]',
  reminders_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create demand_templates table
CREATE TABLE demand_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  profession_category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create demand_template_items table
CREATE TABLE demand_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES demand_templates(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL CHECK (item_type IN ('text', 'file', 'multiple_choice', 'date', 'number')),
  expected_format TEXT,
  required BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  choices TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ai_call_logs table
CREATE TABLE ai_call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID REFERENCES portals(id) ON DELETE SET NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('completeness_check', 'summary', 'file_verification')),
  provider_attempted TEXT,
  provider_success TEXT,
  status TEXT CHECK (status IN ('success', 'failed', 'timeout')),
  error_message TEXT,
  tokens_input INTEGER,
  tokens_output INTEGER,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ai_summaries table
CREATE TABLE ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES portals(id) ON DELETE CASCADE,
  summary_text TEXT,
  provider_used TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity_log table
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portal_id UUID REFERENCES portals(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('portal_created', 'link_sent', 'submission_received', 'reminder_sent', 'file_expired')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create client_profiles table
CREATE TABLE client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to portals table
ALTER TABLE portals ADD COLUMN IF NOT EXISTS client_profile_id UUID REFERENCES client_profiles(id) ON DELETE SET NULL;
ALTER TABLE portals ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Create indexes
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

-- Enable RLS
ALTER TABLE portal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_access_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;
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

CREATE POLICY "Owners can view ai_call_logs" ON ai_call_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = ai_call_logs.portal_id AND portals.user_id = auth.uid())
);
CREATE POLICY "System can manage ai_call_logs" ON ai_call_logs FOR ALL WITH CHECK (true);

CREATE POLICY "Owners can view ai_summaries" ON ai_summaries FOR SELECT USING (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = ai_summaries.portal_id AND portals.user_id = auth.uid())
);
CREATE POLICY "System can manage ai_summaries" ON ai_summaries FOR ALL WITH CHECK (true);

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
