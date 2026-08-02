-- Migration 004: Remove password auth, keep display_name
-- Date: 2026-07-21
-- Purpose: Clean up password-related columns for Google OAuth-only auth

-- Drop password_hash column from users table (was unused)
ALTER TABLE users DROP COLUMN IF EXISTS password_hash;

-- Add avatar_url if not present (from Google OAuth profile picture)
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- NOTE: We intentionally keep display_name column
-- Drizzle schema uses displayName (camelCase) which maps to display_name in DB
-- Do NOT rename to full_name — that breaks Drizzle mappings

-- Drop forgot_password_requests table if it exists (leftover from email auth)
DROP TABLE IF EXISTS forgot_password_requests CASCADE;
