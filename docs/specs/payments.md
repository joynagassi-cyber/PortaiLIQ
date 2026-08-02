# Spec: Payments (Gumroad)

> Gumroad handles all payments and licensing. Three paid plans. No free tier.

## Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/gumroad/products` | Public | List available plans |
| POST | `/api/gumroad/verify` | Required | Verify user license |
| POST | `/api/gumroad/webhook` | Public (secret) | Gumroad webhook handler |

## Plans

| Plan | Gumroad Product ID | Price | Features |
|------|-------------------|-------|----------|
| Starter | `{GUMROAD_STARTER_PRODUCT_ID}` | $9/mo | Up to 5 portals, all field types, scheduled reminders, basic AI |
| Professional | `{GUMROAD_PRO_PRODUCT_ID}` | $29/mo | Unlimited portals, custom branding, advanced AI, analytics |
| Agency | `{GUMROAD_AGENCY_PRODUCT_ID}` | $99/mo | Everything + team seats, white-label, API access |

## Gumroad Product IDs

Configured per environment. Example:
```env
GUMROAD_STARTER_PRODUCT_ID="abc123"
GUMROAD_PRO_PRODUCT_ID="def456"
GUMROAD_AGENCY_PRODUCT_ID="ghi789"
```

## API: List Products

### GET /api/gumroad/products → 200 OK

```json
{
  "products": [
    {
      "name": "Starter",
      "price": "$9/mo",
      "features": [
        "Up to 5 active portals",
        "All field types + file upload",
        "Scheduled reminders",
        "Basic AI summaries"
      ],
      "gumroadProductId": "abc123",
      "popular": false
    },
    {
      "name": "Professional",
      "price": "$29/mo",
      "features": [
        "Unlimited portals",
        "Custom branding & themes",
        "Advanced AI (extract, categorize, translate)",
        "Priority email support",
        "Analytics dashboard"
      ],
      "gumroadProductId": "def456",
      "popular": true
    },
    {
      "name": "Agency",
      "price": "$99/mo",
      "features": [
        "Everything in Professional",
        "Team seats (up to 10)",
        "White-label portals",
        "API access",
        "Custom integrations"
      ],
      "gumroadProductId": "ghi789",
      "popular": false
    }
  ]
}
```

## API: Verify License

### POST /api/gumroad/verify → 200 OK

```json
{
  "valid": true,
  "tier": "professional",
  "expiresAt": null
}
```

### POST /api/gumroad/verify → 400 Bad Request

```json
{
  "valid": false,
  "message": "Invalid license key"
}
```

## API: Webhook Handler

### POST /api/gumroad/webhook → 200 OK

Handles events from Gumroad:

| Event | Action |
|-------|--------|
| `purchase` | Create/update `gumroad_licenses` record, set user plan tier |
| `refunded` | Revoke license, downgrade to "no plan" |
| `dispute_started` | Suspend license pending resolution |
| `dispute_needed` | Suspend license pending resolution |

**Webhook signature verification:**
```typescript
const signature = request.headers.get("x-gumroad-signature");
const expected = createHmac("sha256", GUMROAD_WEBHOOK_SECRET).update(body).digest("hex");
if (signature !== expected) return 401;
```

## License Schema (DB)

```typescript
export const gumroadLicenses = pgTable("gumroad_licenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  gumroadLicenseKey: text("gumroad_license_key").unique().notNull(),
  gumroadOrderId: text("gumroad_order_id"),
  productId: text("product_id").notNull(),
  productName: text("product_name"),
  planTier: subscriptionEnum("plan_tier").default("none").notNull(),
  // "none" = no plan, "starter", "professional", "agency"
  isVerified: boolean("is_verified").default(false).notNull(),
  verifiedAt: timestamp("verified_at"),
  expiresAt: timestamp("expires_at"),
  status: gumroadLicenseStatusEnum("status").default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

## Middleware: License Check

Every protected route checks license before allowing the action:

```typescript
async function requireActiveLicense(userId: string): Promise<PlanTier | null> {
  const license = await db.query.gumroadLicenses.findFirst({
    where: (licenses, { eq, and }) =>
      and(
        eq(licenses.userId, userId),
        eq(licenses.status, "active"),
        eq(licenses.isVerified, true),
      ),
  });
  return license?.planTier || null;
}
```

Plan enforcement:
- **none** → 402 Payment Required on portal creation
- **starter** → max 5 active portals
- **professional** → unlimited portals
- **agency** → unlimited + team features

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| User purchases but webhook hasn't arrived | License verification polls Gumroad API |
| User refunds then repurchases | Update existing license record |
| Gumroad API rate limited | Retry 3x with exponential backoff |
| Webhook signature invalid | 401, log security event |
| User upgrades from Starter to Pro | Update plan_tier in existing license record |
| User downgrades (doesn't renew) | Status stays "active" until expires_at |

## Files

| File | Role |
|------|------|
| `src/lib/gumroad.ts` | Gumroad API client + license verification |
| `src/app/api/gumroad/verify/route.ts` | POST verify license |
| `src/app/api/gumroad/webhook/route.ts` | POST webhook handler |
| `src/app/api/gumroad/products/route.ts` | GET list products |
| `src/middleware.ts` | License check middleware |
