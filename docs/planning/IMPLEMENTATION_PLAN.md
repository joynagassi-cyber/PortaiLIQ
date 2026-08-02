# PortaiLIQ — Implementation Plan

> Roadmap from clean spec to deployed SaaS. Organized in sprints with stories.

---

## Sprint 0: Foundation (Day 1-2)

**Goal:** Clean slate. Delete wrong code. Set up correct structure.

### Stories

- [ ] **S0.1** Delete all Vercel-specific code (blob, kv imports)
- [ ] **S0.2** Remove `passwordHash` from schema, create `004_remove_password_auth.sql` migration
- [ ] **S0.3** Delete `forgot-password/` and `auth/reset-password/` pages
- [ ] **S0.4** Simplify `signup/page.tsx` → redirect to `/signin`
- [ ] **S0.5** Update `signin/page.tsx` → Google only, remove email/password form + GitHub button
- [ ] **S0.6** Create `src/lib/supabase/client.ts` and `src/lib/supabase/server.ts` (proper split)
- [ ] **S0.7** Create middleware for auth protection + license check
- [ ] **S0.8** Update `globals.css` with design tokens from DESIGN.md
- [ ] **S0.9** Verify: `npm run build` passes with zero errors

### Deliverables
- Clean project structure
- Google OAuth auth flow working
- No password auth remnants
- Design tokens in CSS

---

## Sprint 1: Core Portals (Day 3-5)

**Goal:** Freelancer can create portals, add items, share links.

### Stories

- [ ] **S1.1** Rewrite `src/app/api/portals/route.ts` — full CRUD with license check
- [ ] **S1.2** Rewrite `src/app/api/portals/[id]/items/route.ts` — item CRUD
- [ ] [S1.3]** Rewrite `src/app/api/portal/[token]/route.ts` — public portal data API
- [ ] **S1.4** Rewrite `src/app/dashboard/page.tsx` — stats + portal list (correct queries)
- [ ] **S1.5** Rewrite `src/app/dashboard/portal-list.tsx` — portal cards with correct data
- [ ] **S1.6** Rewrite `src/app/dashboard/create-portal-dialog.tsx` — portal + items creation
- [ ] **S1.7** Create `src/app/api/portals/[id]/links/route.ts` — generate access link
- [ ] **S1.8** Verify: Create portal → add items → generate link → see in dashboard

### Deliverables
- Full portal CRUD
- Item management
- Link generation
- Dashboard with correct stats

---

## Sprint 2: Client Portal & Submissions (Day 6-8)

**Goal:** Clients can fill out portals via public link.

### Stories

- [ ] **S2.1** Rewrite `src/app/portal/[token]/page.tsx` — dynamic form from portal items
- [ ] **S2.2** Rewrite `src/app/api/submissions/route.ts` — correct submission flow (portal_item_id + link_id)
- [ ] **S2.3** Rewrite `src/app/portal/[token]/status/page.tsx` — public status page
- [ ] **S2.4** Implement file upload flow: presign → R2 → complete
- [ ] **S2.5** Create `src/app/api/upload/presign/route.ts` — presigned URL generation
- [ ] **S2.6** Create `src/app/api/upload/complete/route.ts` — confirm upload + store metadata
- [ ] **S2.7** Verify: Open portal link → fill form → submit → see status page

### Deliverables
- Public portal form (all field types)
- File upload via R2 presigned URLs
- Submission confirmation
- Status page

---

## Sprint 3: Templates & Kits (Day 9-10)

**Goal:** Freelancers can create, manage, and apply templates.

### Stories

- [ ] **S3.1** Rewrite `src/app/api/templates/route.ts` — template CRUD
- [ ] **S3.2** Create `src/app/api/templates/[id]/items/route.ts` — template item CRUD
- [ ] **S3.3** Create `src/app/api/templates/[id]/apply/route.ts` — apply template to new portal
- [ ] **S3.4** Update `src/app/api/starter-kits/route.ts` — static starter kits data
- [ ] **S3.5** Rewrite `src/app/templates/page.tsx` — templates list + starter kits
- [ ] **S3.6** Verify: Create template → apply to portal → see items copied

### Deliverables
- Template CRUD
- Starter kits (5 professions)
- Template application to new portals

---

## Sprint 4: AI Layer (Day 11-12)

**Goal:** AI features integrated into portal flow.

### Stories

- [ ] **S4.1** Rewrite `src/lib/ai-router.ts` — provider config, failover, caching
- [ ] **S4.2** Rewrite `src/app/api/ai/route.ts` — AI endpoint with logging
- [ ] **S4.3** Integrate completeness check into portal form (client-side before submit)
- [ ] **S4.4** Integrate file verification after upload completes
- [ ] **S4.5** Trigger AI summary after all submissions received
- [ ] **S4.6** Verify: Submit portal → AI checks run → summary generated

### Deliverables
- AI router with 4 providers
- Completeness check in portal form
- File verification after upload
- Auto-summary on completion

---

## Sprint 5: Emails & Reminders (Day 13-14)

**Goal:** Email notifications work correctly.

### Stories

- [ ] **S5.1** Rewrite `src/lib/brevo.ts` — email templates with design system colors
- [ ] **S5.2** Create `src/app/api/reminders/route.ts` — manual reminder send
- [ ] **S5.3** Create `src/app/api/cron/reminders/route.ts` — scheduled reminder cron
- [ ] **S5.4** Create `src/app/api/cron/cleanup/route.ts` — file cleanup cron
- [ ] **S5.5** Wire welcome email on link creation
- [ ] **S5.6** Wire submission confirmation email
- [ ] **S5.7** Verify: Create link → welcome email, Submit → confirmation email, Cron → reminders

### Deliverables
- Brevo email integration
- Welcome + confirmation + reminder emails
- Scheduled reminder cron
- File cleanup cron

---

## Sprint 6: Payments & Licensing (Day 15-16)

**Goal:** Gumroad payments gate all features.

### Stories

- [ ] **S6.1** Rewrite `src/lib/gumroad.ts` — license verification + webhook handling
- [ ] **S6.2** Create `src/app/api/gumroad/verify/route.ts` — verify license endpoint
- [ ] **S6.3** Create `src/app/api/gumroad/webhook/route.ts` — Gumroad webhook handler
- [ ] **S6.4** Create `src/app/api/gumroad/products/route.ts` — list products
- [ ] **S6.5** Rewrite `src/app/pricing/page.tsx` — correct plan cards with Gumroad links
- [ ] **S6.6** Add license middleware check to portal creation
- [ ] **S6.7** Verify: Purchase → license verified → portal creation unlocked

### Deliverables
- Gumroad payment integration
- License verification middleware
- Correct pricing page
- Plan-based feature gating

---

## Sprint 7: Polish & Export (Day 17-18)

**Goal:** Final features and quality polish.

### Stories

- [ ] **S7.1** Rewrite `src/app/api/exports/csv/route.ts` — correct CSV export
- [ ] **S7.2** Add CSV export button to dashboard portal list
- [ ] **S7.3** Fix all hardcoded colors across the codebase
- [ ] **S7.4** Ensure all UI text is in English
- [ ] **S7.5** Add loading states to all async operations
- [ ] **S7.6** Add error toasts for all API failures
- [ ] **S7.7** Verify: Export CSV, all colors correct, all text English, loading states work

### Deliverables
- CSV export working
- Design system compliance
- Loading states
- Error handling

---

## Sprint 8: Deploy (Day 19-20)

**Goal:** Production deployment.

### Stories

- [ ] **S8.1** Create `.env.example` with all required variables
- [ ] **S8.2** Configure `wrangler.toml` for Cloudflare deployment
- [ ] **S8.3** Set up Cloudflare R2 bucket + KV namespace
- [ ] **S8.4** Run migrations on production Supabase
- [ ] **S8.5** Deploy to Cloudflare Pages
- [ ] **S8.6** Configure Google OAuth in Supabase
- [ ] **S8.7** Configure Brevo sender email
- [ ] **S8.8** Configure Gumroad products + webhooks
- [ ] **S8.9** Configure AI provider keys
- [ ] **S8.10** End-to-end test: sign up → create portal → share link → submit → export CSV

### Deliverables
- Production deployment
- All integrations configured
- End-to-end flow verified
