# PortaiLIQ — Tech Stack

> **Single source of truth.** Every technology decision for PortaiLIQ.
> Last updated: 2026-07-21

---

## Core Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Framework | **Next.js 14** (App Router) | Mature, stable, well-documented. Not 16 — 14 is the latest stable. |
| Language | **TypeScript** | Type safety across frontend and backend |
| Styling | **Tailwind CSS 3.4** + `tw-animate-css` | Utility-first, design tokens via CSS variables |
| UI Components | **shadcn/ui** (Radix UI + CVA) | Accessible, composable, no vendor lock-in |
| State | **TanStack Query** (via `@insforge/sdk`) | Server-state caching, optimistic updates |
| Forms | **React Hook Form** + **Zod** | Client + server validation with shared schemas |
| Icons | **lucide-react** | Consistent icon set, tree-shakeable |
| Themes | **next-themes** | Light/dark mode support |
| Notifications | **Sonner v2** | Toast notifications (replaces Radix Toast) |

## Backend / Infra

| Layer | Technology | Reason |
|-------|-----------|--------|
| Deployment | **Cloudflare Workers** via `@cloudflare/next-on-pages` | Edge runtime, free tier generous, R2 native |
| Database | **Supabase PostgreSQL** | Managed Postgres with RLS |
| ORM | **Drizzle ORM** | Type-safe, lightweight, Supabase-compatible |
| Migrations | **Drizzle Kit** | CLI-based, deterministic migrations |
| File Storage | **Cloudflare R2** | 10 GB free, zero egress fees, S3-compatible |
| Auth | **Supabase Auth** (Google OAuth only) | No email/password, no domain needed for SMTP |
| Rate Limiting | **Cloudflare KV** | Edge-native, low-latency counters |
| Caching | **Cloudflare KV** | Portal structure, templates, AI results, dashboard stats |
| Cron | **Cloudflare Cron Triggers** | Scheduled reminders, file cleanup |

## Third-Party Services

| Service | Purpose | Cost |
|---------|---------|------|
| **Supabase** | Postgres + Auth | Free tier |
| **Cloudflare** | Hosting + R2 + KV + Workers | Free tier ($5/mo if limits hit) |
| **Brevo** | Transactional emails | Free (300/day) |
| **Gumroad** | Payments + licensing | 10% commission |
| **AI Providers** (4) | Intelligence layer | All free tiers |

## AI Providers (Failover Router)

| Priority | Provider | Model | Free Tier |
|----------|----------|-------|-----------|
| 1 | **Agnes AI** | `agnes-2.5-pro` | Unlimited (current) |
| 2 | **Google AI Studio** | `gemini-2.5-flash` | 1,500 req/day |
| 3 | **Cerebras** | `llama3.1-8b` | 1M tokens/day |
| 4 | **Groq** | `llama-3.3-70b` | 14,400 req/day |

All providers use OpenAI-compatible API. Router tries sequentially, returns on first success.

---

## Explicitly NOT Used

- ~~Email/Password Auth~~ — Too much friction for clients, requires domain for SMTP
- ~~Vercel Blob~~ — We use Cloudflare R2
- ~~Vercel KV~~ — We use Cloudflare KV
- ~~Stripe~~ — Gumroad handles payments
- ~~i18n~~ — English only for now
- ~~TanStack Router~~ — Next.js App Router is sufficient
- ~~Redux/Zustand~~ — TanStack Query handles server state

---

## Environment Variables Required

```env
# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_KV_NAMESPACE_ID=
NEXT_PUBLIC_SITE_URL=

# Brevo
BREVO_API_KEY=
BREVO_SENDER_NAME=PortaiLIQ
BREVO_SENDER_EMAIL=noreply.portaliq@gmail.com

# Gumroad
GUMROAD_SECRET_KEY=
GUMROAD_WEBHOOK_SECRET=

# AI Providers (at least one)
AGNES_AI_API_KEY=
GOOGLE_AI_STUDIO_API_KEY=
CEREBRAS_API_KEY=
GROQ_API_KEY=

# Internal
CRON_SECRET=
```

---

## Deployment Target

**Cloudflare Pages** via `@cloudflare/next-on-pages`

```bash
npm run build && npx @cloudflare/next-on-pages
```

This produces a Workers-compatible bundle. Deploy with:
```bash
npm run deploy  # wrangler deploy
```

Or via Git integration (push to `main` → auto-deploy).

---

## Constraints

1. **10ms CPU limit** on Cloudflare free tier. Keep server-side work minimal.
2. **File uploads** go client→R2 via presigned URL (server only generates the URL).
3. **AI is optional** — product works 100% without AI.
4. **Everything is paid** — no free tier for PortaiLIQ itself.
5. **English everywhere** — UI, docs, error messages, emails.
