# PortaiLIQ — Product Requirements Document (PRD)

> **Product:** PortaiLIQ — Client portal SaaS for freelancers
> **Version:** 2.0 (Refactored)
> **Date:** 2026-07-21
> **Language:** English (target: English + French-speaking markets)

---

## 1. Problem

Freelancers (designers, developers, consultants, coaches, photographers) lose hours every week chasing clients for documents and information. They use a messy mix of emails, Google Forms, Dropbox, and manual follow-ups. Existing solutions (Content Snare, ClientPort) are too expensive ($29-99/mo) and complex for solo freelancers.

**PortaiLIQ solves this:** a simple, professional tool for freelancers to create client portals that collect structured information and documents — without requiring the client to create an account.

## 2. Target Users

### Primary: The Freelancer
- Designer, developer, consultant, coach, or photographer
- Manages 3-15 active clients in parallel
- Loses 30min-2hr/week chasing missing documents
- Won't pay $50-99/month — budget is $9-29/month
- Needs something configurable in under 10 minutes

### Secondary: The Client
- Receives a link, creates no account
- Must understand what's needed in 5 seconds
- Abandons if there's more than 1 step of friction
- Needs to see a clear confirmation after submitting

## 3. Core Jobs to Be Done

1. **Freelancer creates a portal** with custom fields (text, file upload, email, phone, date, number, URL, multiple choice)
2. **Freelancer shares a link** with a client (no account needed)
3. **Client fills out the portal** — texts and file uploads, one at a time
4. **Freelancer sees real-time status** — what's received, what's pending
5. **Freelancer sends reminders** — manual and scheduled
6. **Freelancer exports data** — CSV download of all responses
7. **Freelancer reuses templates** — save field combinations, apply to new portals
8. **Freelancer pays for access** — Gumroad handles billing

## 4. Pricing (All Paid — No Free Tier)

| Plan | Price | Features |
|------|-------|----------|
| **Starter** | $9/mo | Up to 5 portals, all field types, file upload, scheduled reminders, basic AI summaries |
| **Professional** | $29/mo | Unlimited portals, custom branding, advanced AI (extract, categorize), priority support, analytics |
| **Agency** | $99/mo | Everything in Pro, team seats (up to 10), white-label portals, API access, custom integrations |

Gumroad handles checkout + licensing. Each plan is a separate Gumroad product.

## 5. Features

### Must Have (v1.0)

| # | Feature | Description |
|---|---------|-------------|
| 1 | Google OAuth Auth | Sign up / sign in with Google only via Supabase Auth |
| 2 | Landing Page | Public page explaining PortaiLIQ, features, pricing |
| 3 | Pricing Page | Gumroad-linked plan cards, FAQ |
| 4 | Dashboard | Stats overview + portal list |
| 5 | Create Portal | Dialog to create portal + add fields |
| 6 | Portal Public Page | Client-facing form (dynamic based on portal fields) |
| 7 | Submissions API | Client submits responses (text + files) |
| 8 | File Upload | R2 presigned URL upload, validation, format warnings |
| 9 | Link Generation | Unique token per client, copy/share |
| 10 | Manual Reminders | Send reminder email via Brevo |
| 11 | Scheduled Reminders | Cron-based automatic reminders (D+3, D+7) |
| 12 | Templates | Create, save, reuse field combinations |
| 13 | Starter Kits | Pre-built templates by profession (5 kits) |
| 14 | AI Router | Multi-provider failover (Agnes → Google → Cerebras → Groq) |
| 15 | AI Completeness Check | Detect vague/incomplete answers |
| 16 | AI Summary | Auto-generate summary when portal is complete |
| 17 | File Verification | Check uploaded file matches requested type |
| 18 | Gumroad Integration | License verification + webhook handling |
| 19 | CSV Export | Download all portal responses as CSV |
| 20 | Status Page | Public page showing submission progress |

### Should Have (v1.1)

| # | Feature | Description |
|---|---------|-------------|
| 21 | Permanent Client Link | Single link per client accumulating all projects |
| 22 | Client Journal View | History of everything a client has sent across portals |
| 23 | File Expiry Cleanup | Cron job deletes files older than 30 days |
| 24 | Rate Limiting | Protect public endpoints from abuse |

### Won't Have (v1)

- Email/password auth
- Multi-language (i18n)
- Electronic signatures
- CRM features
- Project management
- Live chat
- SMS notifications

## 6. Data Model (Final)

```
users (freelances)
├── id, email, name, avatar_url, profession, created_at, updated_at

client_profiles (clients of the freelancer)
├── id, user_id, name, email, created_at, updated_at

portals (collection spaces)
├── id, user_id, client_profile_id, name, description, logo_url, status, created_at, updated_at

demand_templates (reusable field sets)
├── id, user_id, name, profession_category, created_at

demand_template_items (fields in a template)
├── id, template_id, label, description, item_type, expected_format, required, choices, sort_order, created_at

portal_items (fields instantiated in a portal)
├── id, portal_id, template_item_id, label, description, item_type, expected_format, required, choices, sort_order, created_at, updated_at

portal_access_links (shareable links)
├── id, portal_id, token, client_label, expires_at, reminder_schedule, reminders_enabled, created_at

submissions (client responses)
├── id, portal_item_id, portal_access_link_id, content_text, file_url, file_name, file_size, file_type, status, submitted_at, updated_at

ai_summaries (AI-generated summaries)
├── id, portal_id, summary_text, provider_used, tokens_used, created_at

ai_call_logs (AI call audit trail)
├── id, portal_id, task_type, provider_attempted, provider_success, status, error_message, tokens_input, tokens_output, duration_ms, created_at

activity_log (audit trail)
├── id, user_id, portal_id, action, metadata, created_at

gumroad_licenses (payment/licensing)
├── id, user_id, gumroad_license_key, gumroad_order_id, product_id, product_name, plan_tier, is_verified, verified_at, expires_at, status, created_at, updated_at
```

## 7. Success Metrics

- Freelancer creates first portal within 3 minutes of signing up
- Client completes portal in under 5 minutes
- Reminder email open rate > 40%
- AI completeness check catches > 80% of vague answers
- Zero downtime for core features (portal creation, submission, file upload)
