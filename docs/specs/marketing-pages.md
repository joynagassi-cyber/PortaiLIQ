# Spec: Marketing Pages

> Landing page and pricing page. Public, no auth required.

## Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Public | Landing page |
| GET | `/pricing` | Public | Pricing page |

## Landing Page (`/`)

### Sections

1. **Hero** — Headline, subheadline, CTA buttons ("Get Started", "See Pricing")
2. **Features** — 3 cards: Create Portals, Secure Collection, AI-Powered
3. **Pricing Preview** — Quick plan comparison with "View All Plans" CTA
4. **Footer** — Copyright, links

### Copy

```
Hero:
  Headline: "Collect client information, simply."
  Sub: "PortaiLIQ lets freelancers create professional client portals
       to collect documents and information — structured, trackable,
       and follow-up ready."
  CTA: "Get Started" → /signin

Features:
  1. "Create Portals" — Define custom fields and questions for each client.
     Text, files, dates, multiple choice. Configure in minutes.
  2. "Secure Collection" — Share token-based links. Track completion in
     real-time. Automatic reminders keep things moving.
  3. "AI-Powered" — Intelligent completeness checks, auto-summaries,
     and file verification. Works without AI too.
```

### Design Rules (from DESIGN.md)

- Gradient background: `bg-gradient-to-br from-background to-muted`
- One accent color: blue `var(--primary)`
- System font stack
- Container: `container mx-auto px-4`
- No hardcoded colors
- No gradients on buttons (use solid primary color)
- No card grids with identical cards

## Pricing Page (`/pricing`)

### Plan Cards

| Plan | Price | CTA Link |
|------|-------|----------|
| Starter | $9/mo | Gumroad checkout URL |
| Professional | $29/mo | Gumroad checkout URL |
| Agency | $99/mo | Gumroad checkout URL |

Each card shows:
- Plan name
- Price
- Feature list
- "Upgrade" button → opens Gumroad checkout in new tab

### FAQ Section

```
Q: How does payment work?
A: We use Gumroad for secure checkout. After purchase, your plan activates immediately.

Q: Can I switch plans later?
A: Yes. Purchase a different plan on Gumroad and your tier updates automatically.

Q: Is there a free trial?
A: No. All plans are paid. Start with Starter and upgrade as you grow.

Q: What happens if I cancel?
A: Your account remains active until the end of your billing period. Portals and data are preserved.
```

### Design Rules

- Background: `bg-gradient-to-br from-background to-muted`
- Cards use design system tokens (not `bg-gray-100`, not `border-blue-500`)
- "Popular" badge on Professional plan
- Responsive: 1 column mobile, 3 columns desktop
- All text in English

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Logged-in user visits landing page | Show "Go to Dashboard" instead of "Get Started" |
| User with no plan visits pricing | Normal display |
| User with active plan visits pricing | Show "Manage your plan" CTA instead of "Upgrade" |
| Gumroad checkout link broken | 404 on Gumroad side → show "Contact support" |

## Files

| File | Role |
|------|------|
| `src/app/page.tsx` | Landing page |
| `src/app/pricing/page.tsx` | Pricing page |
