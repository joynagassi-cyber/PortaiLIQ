# Spec: Authentication

> Google OAuth only via Supabase Auth. No email/password.

## Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/signin` | Public | Sign-in page with Google OAuth button |
| GET | `/signup` | Public | Redirects to `/signin` (same flow) |
| POST | `/api/auth/callback` | Public | Supabase OAuth callback handler |
| POST | `/api/auth/signout` | Required | Clear session |

## What Changes from Current Code

- **REMOVE** `forgot-password/page.tsx` — not needed without email/password
- **REMOVE** `auth/reset-password/page.tsx` — not needed
- **REMOVE** `users.passwordHash` from schema — Supabase handles auth
- **REMOVE** `users.password_hash` column from DB
- **KEEP** Google OAuth button on signin page (already exists)
- **REMOVE** GitHub OAuth button — not in scope
- **SIMPLIFY** signup page → just a redirect to `/signin`

## Supabase Config

```
Providers: google only
Email sign-ups: DISABLED
Password sign-ups: DISABLED
OAuth: ENABLED (Google)
Email confirmations: DISABLED (Google provides verified email)
```

## User Flow

1. User visits `/signin`
2. Clicks "Continue with Google"
3. Supabase redirects to Google consent screen
4. Google redirects back to `/api/auth/callback`
5. Supabase creates/updates user in `users` table
6. Redirect to `/dashboard`

## Zod Schema

```typescript
const signInWithGoogleSchema = z.object({}); // No body — OAuth redirect
```

## Error Handling

| Scenario | HTTP Status | Message |
|----------|-------------|---------|
| User cancels Google consent | Redirect to `/signin?error=access_denied` | "Authentication cancelled" |
| Google returns unexpected email | 400 | "Unexpected email from Google" |
| Supabase creates user but DB insert fails | 500 | "Failed to create account" |

## DB Changes

```sql
-- REMOVE from users table:
ALTER TABLE users DROP COLUMN IF EXISTS password_hash;

-- ADD to users table:
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Or map existing columns:
-- email → users.email (already exists via Supabase auth.users)
-- display_name → users.full_name (rename column)
```

## Files to Modify

| File | Action |
|------|--------|
| `src/db/schema.ts` | Remove `passwordHash`, add `fullName`, `avatarUrl` |
| `src/app/signin/page.tsx` | Remove email/password form, keep Google button only |
| `src/app/signup/page.tsx` | Replace with redirect to `/signin` |
| `src/app/forgot-password/page.tsx` | **DELETE** |
| `src/app/auth/reset-password/page.tsx` | **DELETE** |
| `src/app/auth/callback/route.ts` | Verify handles Google redirect |
| `src/app/auth/signout/route.ts` | Verify signs out via Supabase |
| `src/middleware.ts` | Protect `/dashboard/*`, `/api/portals/*`, `/api/templates/*` |
