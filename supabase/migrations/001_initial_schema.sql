-- ==========================================
-- PortaiLIQ Database Schema (Drizzle ORM aligned)
-- ==========================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portals table
CREATE TABLE IF NOT EXISTS portals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  theme JSONB DEFAULT '{"primary_color": "#3b82f6", "logo_url": null}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portal Items table
CREATE TABLE IF NOT EXISTS portal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES portals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('document', 'form', 'file_upload', 'payment', 'survey', 'custom')),
  config JSONB DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES portals(id) ON DELETE CASCADE,
  item_id UUID REFERENCES portal_items(id) ON DELETE SET NULL,
  client_name TEXT,
  client_email TEXT,
  data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT
);

-- Files table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES portals(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  original_name TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  r2_bucket TEXT NOT NULL DEFAULT 'portailiq-files',
  content_type TEXT,
  size_bytes BIGINT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sharing Links table
CREATE TABLE IF NOT EXISTS sharing_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES portals(id) ON DELETE CASCADE,
  link_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES portals(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  template_key TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  portal_id UUID REFERENCES portals(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  changes JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Processing Queue table
CREATE TABLE IF NOT EXISTS ai_processing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES portals(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL CHECK (task_type IN ('summarize', 'categorize', 'extract_data', 'translate', 'custom')),
  prompt_template TEXT,
  input_data JSONB NOT NULL DEFAULT '{}',
  result JSONB,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  error_message TEXT,
  provider_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Gumroad Licenses table (replaces Stripe)
CREATE TABLE IF NOT EXISTS gumroad_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gumroad_license_key TEXT UNIQUE NOT NULL,
  gumroad_order_id TEXT,
  product_id TEXT NOT NULL,
  product_name TEXT,
  plan_tier TEXT NOT NULL DEFAULT 'free' CHECK (plan_tier IN ('free', 'starter', 'professional', 'agency')),
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_portals_user_id ON portals(user_id);
CREATE INDEX IF NOT EXISTS idx_portals_token ON portals(token);
CREATE INDEX IF NOT EXISTS idx_portals_status ON portals(status);
CREATE INDEX IF NOT EXISTS idx_portal_items_portal_id ON portal_items(portal_id);
CREATE INDEX IF NOT EXISTS idx_submissions_portal_id ON submissions(portal_id);
CREATE INDEX IF NOT EXISTS idx_submissions_client_email ON submissions(client_email);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_files_portal_id ON files(portal_id);
CREATE INDEX IF NOT EXISTS idx_sharing_links_portal_id ON sharing_links(portal_id);
CREATE INDEX IF NOT EXISTS idx_sharing_links_token ON sharing_links(link_token);
CREATE INDEX IF NOT EXISTS idx_notifications_portal_id ON notifications(portal_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_portal_id ON audit_logs(portal_id);
CREATE INDEX IF NOT EXISTS idx_ai_queue_status ON ai_processing_queue(status);
CREATE INDEX IF NOT EXISTS idx_ai_queue_portal_id ON ai_processing_queue(portal_id);
CREATE INDEX IF NOT EXISTS idx_gumroad_licenses_user_id ON gumroad_licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_gumroad_licenses_license_key ON gumroad_licenses(gumroad_license_key);
CREATE INDEX IF NOT EXISTS idx_gumroad_licenses_status ON gumroad_licenses(status);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portals ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE sharing_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE gumroad_licenses ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Portals
CREATE POLICY "Owners can view portals" ON portals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owners can create portals" ON portals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update portals" ON portals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owners can delete portals" ON portals FOR DELETE USING (auth.uid() = user_id);

-- Portal Items
CREATE POLICY "Owners can view items" ON portal_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = portal_items.portal_id AND portals.user_id = auth.uid())
);
CREATE POLICY "Owners can create items" ON portal_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = portal_items.portal_id AND portals.user_id = auth.uid())
);
CREATE POLICY "Owners can update items" ON portal_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = portal_items.portal_id AND portals.user_id = auth.uid())
);
CREATE POLICY "Owners can delete items" ON portal_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = portal_items.portal_id AND portals.user_id = auth.uid())
);

-- Submissions
CREATE POLICY "Anyone can submit" ON submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners can view submissions" ON submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = submissions.portal_id AND portals.user_id = auth.uid())
);
CREATE POLICY "Owners can update submissions" ON submissions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = submissions.portal_id AND portals.user_id = auth.uid())
);

-- Files
CREATE POLICY "Owners can view files" ON files FOR SELECT USING (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = files.portal_id AND portals.user_id = auth.uid())
);
CREATE POLICY "Owners can create files" ON files FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = files.portal_id AND portals.user_id = auth.uid())
);
CREATE POLICY "Owners can delete files" ON files FOR DELETE USING (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = files.portal_id AND portals.user_id = auth.uid())
);

-- Sharing Links
CREATE POLICY "Owners can view links" ON sharing_links FOR SELECT USING (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = sharing_links.portal_id AND portals.user_id = auth.uid())
);
CREATE POLICY "Owners can create links" ON sharing_links FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = sharing_links.portal_id AND portals.user_id = auth.uid())
);
CREATE POLICY "Owners can update links" ON sharing_links FOR UPDATE USING (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = sharing_links.portal_id AND portals.user_id = auth.uid())
);
CREATE POLICY "Owners can delete links" ON sharing_links FOR DELETE USING (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = sharing_links.portal_id AND portals.user_id = auth.uid())
);

-- Notifications
CREATE POLICY "Owners can view notifications" ON notifications FOR SELECT USING (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = notifications.portal_id AND portals.user_id = auth.uid())
);
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Audit Logs
CREATE POLICY "Owners can view audit logs" ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = audit_logs.portal_id AND portals.user_id = auth.uid())
);
CREATE POLICY "System can create audit logs" ON audit_logs FOR INSERT WITH CHECK (true);

-- AI Queue
CREATE POLICY "Owners can view ai queue" ON ai_processing_queue FOR SELECT USING (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = ai_processing_queue.portal_id AND portals.user_id = auth.uid())
);
CREATE POLICY "System can manage ai queue" ON ai_processing_queue FOR ALL WITH CHECK (true);

-- Gumroad Licenses
CREATE POLICY "Users can view own gumroad data" ON gumroad_licenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage gumroad data" ON gumroad_licenses FOR ALL WITH CHECK (true);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portals_updated_at BEFORE UPDATE ON portals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portal_items_updated_at BEFORE UPDATE ON portal_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gumroad_licenses_updated_at BEFORE UPDATE ON gumroad_licenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Token generators
CREATE OR REPLACE FUNCTION generate_portal_token()
RETURNS TEXT AS $$
DECLARE
  result TEXT := encode(gen_random_bytes(16), 'hex');
  exists_check BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS(SELECT 1 FROM portals WHERE token = result) INTO exists_check;
    EXIT WHEN NOT exists_check;
    result := encode(gen_random_bytes(16), 'hex');
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_link_token()
RETURNS TEXT AS $$
DECLARE
  result TEXT := encode(gen_random_bytes(12), 'hex');
  exists_check BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS(SELECT 1 FROM sharing_links WHERE link_token = result) INTO exists_check;
    EXIT WHEN NOT exists_check;
    result := encode(gen_random_bytes(12), 'hex');
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Auto-profile on signup
CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NULL);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_profile();
