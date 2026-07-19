-- Migration 002: Replace Stripe with Gumroad
-- Removes stripe_customers table and adds gumroad_licenses table

-- Drop Stripe tables and policies
DROP TABLE IF EXISTS stripe_customers CASCADE;
DROP TABLE IF EXISTS usage_tracking CASCADE;

-- Create Gumroad Licenses table
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
CREATE INDEX IF NOT EXISTS idx_gumroad_licenses_user_id ON gumroad_licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_gumroad_licenses_license_key ON gumroad_licenses(gumroad_license_key);
CREATE INDEX IF NOT EXISTS idx_gumroad_licenses_status ON gumroad_licenses(status);

-- RLS
ALTER TABLE gumroad_licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gumroad data" ON gumroad_licenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage gumroad data" ON gumroad_licenses FOR ALL WITH CHECK (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_gumroad_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gumroad_licenses_updated_at BEFORE UPDATE ON gumroad_licenses
  FOR EACH ROW EXECUTE FUNCTION update_gumroad_updated_at();
