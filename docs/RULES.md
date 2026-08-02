# PortaiLIQ — Project Rules

> Non-negotiable rules for building PortaiLIQ. Violating these is worse than not building it.

---

## 1. Language

- **All code, UI, docs, error messages in English.**
- No French anywhere in the codebase.
- No i18n library. Not now. Not ever unless the market demands it.

## 2. Authentication

- **Google OAuth only.** Via Supabase Auth.
- No email/password. No forgot-password. No reset-password.
- No `password_hash` column in any table.
- Every protected route checks `supabase.auth.getUser()` or uses middleware.

## 3. Pricing Model

- **Everything is paid.** No free tier.
- Gumroad handles payments + licensing.
- The dashboard shows "No Plan" or "Upgrade Required" for unpaid users.
- `gumroad_licenses` table is the source of truth for access tiers.

## 4. Storage

- **Cloudflare R2 only.** Never Vercel Blob. Never AWS S3.
- Upload flow: client requests presigned URL from server → client uploads directly to R2 → server records metadata.
- Max file size: 10 MB.
- Allowed types: images (JPEG, PNG, GIF, WebP), PDF, DOC/DOCX, XLS/XLSX, TXT, CSV.

## 5. Design System

- **Follow `DESIGN.md` exactly.** It is the law.
- Semantic CSS variables only. No arbitrary Tailwind colors (`bg-blue-50`, `text-gray-900` = forbidden).
- One accent color: blue `#3B82F6`. Everything else is neutral.
- System font stack only. No Google Fonts.
- All labels, headings, toasts, error messages in English.

## 6. API Convention

- Every API route must have: **Auth check → Validation → Business Logic → Response**
- Zod schemas for ALL input validation. No exceptions.
- Consistent error format: `{ error: "message" }` with proper HTTP status codes.
- Consistent success format: `{ success: true, data: {...} }` or `{ [resource]: {...} }`.
- Rate limit public endpoints (submissions, portal access).

## 7. Database

- Drizzle ORM for type safety. Never raw SQL in API routes.
- RLS (Row Level Security) enabled on every table.
- Every table has `created_at` and `updated_at`.
- Soft deletes preferred over hard deletes where data matters.

## 8. AI

- AI is a **layer**, not a dependency. The product works without it.
- Always degrade gracefully: if all providers fail, show "AI unavailable" and continue.
- Log every AI call in `ai_call_logs`.
- Cache AI results in KV (same portal + same items = same summary).

## 9. Emails

- Brevo for all transactional emails.
- Templates must use design system colors (blue primary, not gradients).
- No marketing emails. Only transactional: welcome, submission confirmed, reminder.

## 10. Code Organization

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth routes (grouped)
│   ├── (marketing)/        # Landing, pricing
│   ├── dashboard/          # Protected freelance area
│   ├── portal/             # Public client portals
│   ├── templates/          # Template management
│   └── api/                # API routes
│       ├── auth/           # Supabase auth callbacks
│       ├── portals/        # Portal CRUD
│       ├── submissions/    # Client submissions
│       ├── upload/         # R2 presigned URLs
│       ├── templates/      # Template CRUD
│       ├── starter-kits/   # Pre-built kits
│       ├── ai/             # AI router
│       ├── reminders/      # Email reminders
│       ├── exports/        # CSV export
│       ├── gumroad/        # Payments
│       └── cron/           # Scheduled jobs
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   └── layout/             # Header, Footer, Nav
├── lib/                    # Shared utilities
│   ├── supabase/           # Client + server configs
│   ├── r2.ts               # R2 upload helpers
│   ├── brevo.ts            # Email service
│   ├── gumroad.ts          # Payment verification
│   ├── ai-router.ts        # Multi-provider AI
│   ├── cache.ts            # Cloudflare KV cache
│   ├── validation.ts       # Zod schemas
│   └── utils.ts            # Helpers
└── db/                     # Database
    ├── index.ts            # Drizzle connection
    └── schema.ts           # Table definitions
```

## 11. Anti-Patterns (Forbidden)

- ❌ Hardcoded colors in components (`bg-blue-500`, `text-gray-900`)
- ❌ Hardcoded hex colors in SVGs (`fill="#3B82F6"` → use `var(--primary)`)
- ❌ Left/right border accents on cards/alerts
- ❌ `background-clip: text` with gradients
- ❌ Stacking identical cards in infinite grids
- ❌ "01 · About / 02 · Process" eyebrow labels
- ❌ Glassmorphism by default
- ❌ CSS tokens that don't exist in `globals.css`
- ❌ Mixing radius conventions (`rounded-lg` vs `rounded-xl` in same component)
- ❌ Raw SQL queries in API routes (use Drizzle)
- ❌ Duplicate validation (client + server must use same Zod schema)

## 12. Performance

- Server-side rendering minimal on Cloudflare free tier (10ms CPU).
- Prefetch portal data on client where possible.
- Cache aggressively with KV.
- Batch database queries with `Promise.all`.
