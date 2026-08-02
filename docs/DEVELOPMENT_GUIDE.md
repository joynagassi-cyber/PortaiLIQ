# PortaiLIQ — Development Guide

> How to work on PortaiLIQ. Setup, conventions, commands, deployment.

---

## Quick Start

```bash
# 1. Clone
git clone <repo-url> && cd PortaiLIQ

# 2. Install
npm install

# 3. Copy env
cp .env.example .env.local

# 4. Edit .env.local with your keys (see below)

# 5. Run dev
npm run dev
# → http://localhost:3000
```

## Environment Variables

Create `.env.local` with these variables:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_R2_ACCESS_KEY_ID=your-r2-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-r2-secret-key
CLOUDFLARE_KV_NAMESPACE_ID=your-kv-namespace-id
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Brevo
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_NAME=PortaiLIQ
BREVO_SENDER_EMAIL=noreply.portaliq@gmail.com

# Gumroad
GUMROAD_STARTER_PRODUCT_ID=your-gumroad-starter-product-id
GUMROAD_PRO_PRODUCT_ID=your-gumroad-pro-product-id
GUMROAD_AGENCY_PRODUCT_ID=your-gumroad-agency-product-id
GUMROAD_WEBHOOK_SECRET=your-webhook-secret

# AI Providers (at least one)
AGNES_AI_API_KEY=your-agnes-ai-key
GOOGLE_AI_STUDIO_API_KEY=your-google-ai-key
CEREBRAS_API_KEY=your-cerebras-key
GROQ_API_KEY=your-groq-key

# Internal
CRON_SECRET=your-cron-secret
```

## Commands

```bash
npm run dev          # Start dev server (Next.js)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # ESLint check
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run migrations on Supabase
npm run db:push      # Push schema to DB (dev)
npm run db:studio    # Open Drizzle Studio
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth routes (grouped)
│   ├── (marketing)/        # Landing, pricing
│   ├── dashboard/          # Protected freelance area
│   ├── portal/             # Public client portals
│   ├── templates/          # Template management
│   └── api/                # API routes
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

## Conventions

### Naming
- Files: kebab-case (`create-portal-dialog.tsx`)
- Components: PascalCase (`CreatePortalDialog`)
- Functions: camelCase (`handleCreatePortal`)
- Constants: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- DB columns: snake_case (`user_id`, `created_at`)
- API routes: kebab-case (`/api/upload/presign`)

### Code Style
- TypeScript strict mode enabled
- No `any` types
- No `@ts-ignore`
- All API routes must have: Auth → Validate → Logic → Response
- All user input validated with Zod
- All error messages in English

### Git
- Branches: `feature/description`, `fix/description`
- Commits: conventional commits (`feat:`, `fix:`, `chore:`, `docs:`)
- PRs: description with what/why, screenshot if UI changes

---

## Cloudflare Deployment

### Prerequisites
1. Cloudflare account with Workers + R2 enabled
2. R2 bucket created: `portaliq-uploads`
3. KV namespace created
4. `@cloudflare/next-on-pages` installed

### Build
```bash
npm run build && npx @cloudflare/next-on-pages
```

### Deploy
```bash
npm run deploy  # wrangler deploy
# or
npx wrangler pages deploy .next/static/pages
```

### Cron Configuration (`wrangler.toml`)
```toml
[triggers]
crons = ["0 */6 * * *", "0 0 * * *"]

[[kv_namespaces]]
binding = "KV"
id = "your-kv-namespace-id"

[[r2_buckets]]
binding = "R2"
bucket_name = "portaliq-uploads"
```

---

## Supabase Setup

### Migrations
```bash
# Generate migration from Drizzle schema
npm run db:generate

# Apply to production
npm run db:migrate
```

### RLS
All tables have Row Level Security enabled. Policies defined in migration files.

### Google OAuth
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google
3. Add Google Client ID and Secret
4. Set authorized redirect URL: `https://your-project.supabase.co/auth/v1/callback`

---

## Brevo Setup

1. Create account at brevo.com
2. Generate API key (Transactional)
3. Verify sender email (noreply.portaliq@gmail.com or your domain)
4. Add API key to `.env.local` as `BREVO_API_KEY`

---

## Gumroad Setup

1. Create 3 products in Gumroad dashboard (Starter $9, Professional $29, Agency $99)
2. Get product IDs from product URLs
3. Create webhook endpoint in Gumroad: `https://your-domain.com/api/gumroad/webhook`
4. Generate webhook secret
5. Add product IDs and webhook secret to `.env.local`

---

## AI Providers Setup

At least one API key required. All are optional — product works without AI.

| Provider | Sign up | Free Tier |
|----------|---------|-----------|
| Agnes AI | agnes-ai.com | Unlimited |
| Google AI Studio | aistudio.google.com | 1,500 req/day |
| Cerebras | cerebras.ai | 1M tokens/day |
| Groq | groq.com | 14,400 req/day |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Cannot find module '@vercel/blob'` | This should have been deleted in Sprint 0 |
| `password_hash column not found` | Run migration 004 to remove it |
| Google OAuth fails | Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Supabase |
| R2 upload fails | Check CLOUDFLARE_ACCOUNT_ID and R2 keys |
| Brevo emails not sent | Check BREVO_API_KEY and verify sender email |
| AI returns 503 | Check at least one AI provider API key is set |
