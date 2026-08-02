# PortaiLIQ — Project Status & Validation Checklist

> What's documented, what needs coding, what needs testing.

---

## Documentation Created

| File | Status | Purpose |
|------|--------|---------|
| `docs/STACK.md` | ✅ Written | Tech stack, definitive source |
| `docs/RULES.md` | ✅ Written | Non-negotiable rules |
| `docs/PRD_FINAL.md` | ✅ Written | Product requirements |
| `docs/DEVELOPMENT_GUIDE.md` | ✅ Written | Setup, commands, deployment |
| `docs/specs/auth.md` | ✅ Written | Google OAuth spec |
| `docs/specs/portals.md` | ✅ Written | Portal CRUD spec |
| `docs/specs/portal-items.md` | ✅ Written | Item CRUD spec |
| `docs/specs/submissions.md` | ✅ Written | Client submission spec |
| `docs/specs/upload.md` | ✅ Written | R2 presigned upload spec |
| `docs/specs/ai.md` | ✅ Written | AI router spec |
| `docs/specs/emails.md` | ✅ Written | Brevo email spec |
| `docs/specs/templates.md` | ✅ Written | Template + starter kits spec |
| `docs/specs/payments.md` | ✅ Written | Gumroad payments spec |
| `docs/specs/dashboard.md` | ✅ Written | Dashboard stats spec |
| `docs/specs/portal-public.md` | ✅ Written | Public portal page spec |
| `docs/specs/marketing-pages.md` | ✅ Written | Landing + pricing page spec |
| `docs/specs/csv-export.md` | ✅ Written | CSV export spec |
| `docs/specs/cron.md` | ✅ Written | Cron jobs spec |
| `docs/specs/design-system.md` | ✅ Written | UI design rules |
| `docs/planning/IMPLEMENTATION_PLAN.md` | ✅ Written | 8-sprint roadmap |
| `supabase/migrations/004_remove_password_auth.sql` | ✅ Written | Auth cleanup migration |

---

## Validation Checklist

Before declaring the project "ready for deployment", each of these must be verified:

### Auth
- [ ] Google OAuth sign-in works end-to-end
- [ ] Sign-up redirects to sign-in (no separate signup flow)
- [ ] Forgot-password and reset-password pages deleted
- [ ] `password_hash` column removed from DB
- [ ] Middleware protects `/dashboard/*` routes
- [ ] Public routes (`/portal/*`, `/api/submissions`) don't require auth

### Portals
- [ ] Create portal with name + description works
- [ ] Add items (text, file, email, phone, number, url, date, multiple_choice)
- [ ] Update portal details
- [ ] Delete portal cascades to items + submissions
- [ ] License check blocks portal creation for unpaid users
- [ ] Dashboard shows correct stats

### Submissions
- [ ] Client opens portal link → sees dynamic form
- [ ] Text fields submit correctly
- [ ] File upload: presign → R2 → complete flow works
- [ ] Format warning shows when file doesn't match expected format
- [ ] Required field validation works
- [ ] Submission confirmation email sent via Brevo
- [ ] Status page shows correct submission state

### Templates
- [ ] Create template with items works
- [ ] Apply template creates portal with copied items
- [ ] Starter kits return correct data
- [ ] Delete template works

### AI
- [ ] Router tries providers in priority order
- [ ] Failover works when a provider is down
- [ ] Completeness check integrates into portal form
- [ ] File verification triggers after upload
- [ ] Auto-summary triggers on portal completion
- [ ] AI call logs recorded in DB
- [ ] Product works without AI (graceful degradation)

### Payments
- [ ] Gumroad products listed correctly
- [ ] License verification works
- [ ] Webhook handles purchase, refund, dispute
- [ ] Pricing page links to correct Gumroad products
- [ ] Plan enforcement blocks unpaid users

### Emails
- [ ] Welcome email sent on link creation
- [ ] Submission confirmation sent
- [ ] Reminder emails sent (manual + cron)
- [ ] Email templates use design system colors (blue, no gradients)

### Export
- [ ] CSV download works
- [ ] CSV injection protection active
- [ ] Headers match portal items

### Deployment
- [ ] `npm run build` succeeds
- [ ] `npx @cloudflare/next-on-pages` succeeds
- [ ] Cloudflare R2 bucket configured
- [ ] Cloudflare KV namespace configured
- [ ] Cron triggers configured in wrangler.toml
- [ ] Supabase RLS policies active
- [ ] Google OAuth configured in Supabase
- [ ] Brevo sender email verified
- [ ] Gumroad webhooks configured

---

## Known Risks

| Risk | Mitigation |
|------|-----------|
| Cloudflare 10ms CPU limit | Minimize server work, cache aggressively, use client-side rendering where possible |
| Brevo email deliverability | Use verified sender domain, monitor bounce rate |
| Gumroad webhook delays | Poll Gumroad API as fallback for license verification |
| AI provider rate limits | Failover to next provider, cache results |
| R2 presigned URL expiry | Generate new URL on retry (5min expiry) |
| Supabase RLS policy changes | Test policies after every migration |

---

## What's NOT in Scope (v1)

- Email/password authentication
- Social auth beyond Google
- Multi-language (i18n)
- Mobile app
- Slack/Discord notifications
- Zapier integrations
- Custom domains per freelancer
- White-label portals (Agency plan feature — post-v1)
- Analytics dashboard (Professional plan feature — post-v1)
- Team collaboration (Agency plan feature — post-v1)
