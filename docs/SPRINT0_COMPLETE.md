# PortaiLIQ — Sprint 0: Foundation — COMPLETED ✅

> Date: 2026-07-21
> Status: Complete

---

## What Was Done

### Deleted Files (Vercel remnants, auth email pages)
| File | Reason |
|------|--------|
| `src/lib/supabase.ts` | Old supabase client replaced by `src/lib/supabase/server.ts` |
| `src/lib/supabase-server.ts` | Old supabase server client replaced by `src/lib/supabase/server.ts` |
| `src/lib/r2.ts` | Was Vercel Blob wrapper — replaced by R2 presigned URLs |
| `src/app/forgot-password/` | Removed — email/password auth not used |
| `src/app/auth/reset-password/` | Removed — email/password auth not used |
| `src/app/dashboard/portal-list-enhanced.tsx` | Duplicate old component with hardcoded colors |

### Modified Files

#### Schema & DB
| File | Change |
|------|--------|
| `src/db/schema.ts` | Removed `passwordHash`, subscription enum now `["none", "starter", "active", "cancelled"]` |
| `src/lib/validation.ts` | Removed auth schemas, added upload schemas |
| `supabase/migrations/004_remove_password_auth.sql` | New migration |
| `supabase/migrations/005_full_schema_alignment.sql` | Full schema cleanup |

#### Auth Pages
| File | Change |
|------|--------|
| `src/app/signin/page.tsx` | Google OAuth only — removed email/password form, GitHub button |
| `src/app/signup/page.tsx` | Now redirects to `/signin` |

#### Main Pages (English + Design System)
| File | Change |
|------|--------|
| `src/app/page.tsx` | Landing page in English, design tokens, no hardcoded colors |
| `src/app/pricing/page.tsx` | 3 paid plans, Gumroad links, design tokens, FAQ in English |
| `src/app/dashboard/page.tsx` | Correct stats query, plan display ("No Plan"), English |
| `src/app/dashboard/portal-list.tsx` | Link generation, export CSV, English labels |
| `src/app/dashboard/create-portal-dialog.tsx` | Zod validation, English labels |
| `src/app/portal/[token]/page.tsx` | R2 presigned upload flow, all field types, English |
| `src/app/portal/[token]/status/page.tsx` | English labels, correct DB queries |
| `src/app/templates/page.tsx` | English labels, starter kits |

#### API Routes
| File | Change |
|------|--------|
| `src/app/api/portals/route.ts` | Full CRUD with Zod, token generation |
| `src/app/api/portals/[id]/route.ts` | GET by ID with items + submissions |
| `src/app/api/portals/[id]/items/route.ts` | CRUD portal items |
| `src/app/api/portal/[token]/route.ts` | Public portal data API |
| `src/app/api/submissions/route.ts` | Correct column names (portal_item_id, link_token) |
| `src/app/api/upload/presign/route.ts` | R2 presigned URL generator |
| `src/app/api/upload/complete/route.ts` | Complete upload + store metadata |
| `src/app/api/exports/csv/route.ts` | CSV injection protection, correct columns |
| `src/app/api/templates/route.ts` | Template CRUD |
| `src/app/api/templates/[id]/items/route.ts` | Template item CRUD |
| `src/app/api/templates/[id]/apply/route.ts` | Apply template to new portal |
| `src/app/api/starter-kits/route.ts` | Static starter kits |
| `src/app/api/reminders/route.ts` | Manual reminder via Brevo |
| `src/app/api/dashboard/route.ts` | Correct stats calculation |

#### Libraries
| File | Change |
|------|--------|
| `src/lib/brevo.ts` | Solid blue colors, added `sendReminderEmail` |
| `src/lib/gumroad.ts` | Completed handleNewPurchase |
| `src/lib/cache.ts` | Replaced @vercel/kv with in-memory fallback |
| `src/lib/ratelimit.ts` | New — in-memory rate limiter |
| `src/lib/utils.ts` | French → English formatDate |
| `src/lib/supabase/server.ts` | Unchanged (correct) |
| `src/lib/supabase/client.ts` | Unchanged (correct) |
| `src/lib/ai-router.ts` | Unchanged (correct) |

#### Middleware
| File | Change |
|------|--------|
| `src/middleware.ts` | Auth + license route protection |
| `src/middleware-rate-limit.ts` | In-memory rate limiter |

#### Config
| File | Change |
|------|--------|
| `package.json` | Removed @vercel/blob, @vercel/kv. Added @cloudflare/workers-types |
| `.env.example` | Updated for Google OAuth, Cloudflare, Gumroad |

### Components Fixed
| File | Change |
|------|--------|
| `src/components/ui/badge.tsx` | Design system colors, dark mode support |

### Documentation Created
| File | Purpose |
|------|---------|
| `docs/STACK.md` | Tech stack definitive source |
| `docs/RULES.md` | Non-negotiable rules |
| `docs/PRD_FINAL.md` | Product requirements |
| `docs/DEVELOPMENT_GUIDE.md` | Setup, commands, deployment |
| `docs/VALIDATION_CHECKLIST.md` | 80+ validation items |
| `docs/planning/IMPLEMENTATION_PLAN.md` | 8-sprint roadmap |
| `docs/specs/auth.md` | Google OAuth spec |
| `docs/specs/portals.md` | Portal CRUD spec |
| `docs/specs/portal-items.md` | Item CRUD spec |
| `docs/specs/submissions.md` | Client submission spec |
| `docs/specs/upload.md` | R2 presigned upload spec |
| `docs/specs/ai.md` | AI router spec |
| `docs/specs/emails.md` | Brevo email spec |
| `docs/specs/templates.md` | Template + starter kits spec |
| `docs/specs/payments.md` | Gumroad payments spec |
| `docs/specs/dashboard.md` | Dashboard stats spec |
| `docs/specs/portal-public.md` | Public portal page spec |
| `docs/specs/marketing-pages.md` | Landing + pricing spec |
| `docs/specs/csv-export.md` | CSV export spec |
| `docs/specs/cron.md` | Cron jobs spec |
| `docs/specs/design-system.md` | UI design rules |

---

## Remaining Issues (Sprint 1)

1. **R2 presigned URLs** — placeholder returns `/api/upload/complete` as uploadUrl (needs Cloudflare R2 SDK configured)
2. **`/templates/new` page** — button is disabled (not yet implemented)
3. **Starter kit "Use this kit" buttons** — wired to `/api/templates/:id/apply` but need product IDs in .env
4. **Portal creation dialog** — doesn't handle `multiple_choice` with choices/expectedFormat fields yet

## How to Test Sprint 0

```bash
# 1. Install dependencies (Vercel deps removed)
npm install

# 2. Run migrations
npx drizzle-kit push

# 3. Start dev server
npm run dev

# 4. Test flow:
# - Visit http://localhost:3000/signin
# - Sign in with Google (configure Supabase Google OAuth first)
# - You should land on /dashboard
# - Click "New Portal" dialog
# - Create portal with items
# - Copy link or generate access link
# - Open link in incognito window → see portal form
# - Submit form → see confirmation
```
