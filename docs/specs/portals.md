# Spec: Portals

> CRUD for client collection portals. Each portal belongs to one freelancer and optionally one client profile.

## Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/portals` | Required | List user's portals with stats |
| POST | `/api/portals` | Required | Create a new portal |
| PUT | `/api/portals/:id` | Required | Update portal (name, description, logo, status) |
| DELETE | `/api/portals/:id` | Required | Delete portal + cascade items/submissions |
| GET | `/api/portals/:id` | Required | Get single portal with items |

## Portal Schema (DB)

```typescript
// Drizzle schema (src/db/schema.ts)
export const portals = pgTable("portals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  clientProfileId: uuid("client_profile_id").references(() => clientProfiles.id, { onDelete: "set null" }),
  name: text("name").notNull().$defaultFn(() => crypto.randomUUID()),
  description: text("description"),
  logoUrl: text("logo_url"),
  status: portalStatusEnum("status").default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

## Zod Schemas

```typescript
export const createPortalSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  clientProfileId: z.string().uuid().optional(),
});

export const updatePortalSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["active", "archived", "completed"]).optional(),
});
```

## API Responses

### GET /api/portals → 200 OK

```json
{
  "portals": [
    {
      "id": "uuid",
      "name": "Onboarding — Acme Corp",
      "description": "Initial project kickoff",
      "status": "active",
      "logoUrl": null,
      "itemCount": 5,
      "submissionCount": 3,
      "completedCount": 2,
      "createdAt": "2026-07-21T10:00:00Z"
    }
  ]
}
```

### POST /api/portals → 201 Created

```json
{
  "portal": {
    "id": "uuid",
    "name": "Onboarding — Acme Corp",
    "description": "Initial project kickoff",
    "status": "active",
    "createdAt": "2026-07-21T10:00:00Z"
  }
}
```

### PUT /api/portals/:id → 200 OK

```json
{
  "portal": { "id": "uuid", "name": "Updated name", ... }
}
```

### DELETE /api/portals/:id → 200 OK

```json
{
  "success": true,
  "message": "Portal deleted"
}
```

## Business Logic

1. **Create:** Validate schema → check user has active Gumroad license → insert portal → return portal
2. **List:** Query portals WHERE user_id = auth.user.id → JOIN with portal_items count + submissions count → return enriched list
3. **Update:** Validate schema → check user owns portal → UPDATE → return updated portal
4. **Delete:** Check user owns portal → CASCADE delete (items, submissions, links) → return success
5. **License check:** Before creating portal, verify user has active `gumroad_licenses` entry. If not, return 402 Payment Required.

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| User tries to create portal without paying | 402 Payment Required |
| User tries to delete portal with active submissions | Allow (cascade deletes) |
| Portal name exceeds 100 chars | 400 Validation Error |
| Portal name is empty | 400 Validation Error |
| Concurrent portal creation (race condition) | DB unique constraint on user_id handles it |

## Files

| File | Role |
|------|------|
| `src/app/api/portals/route.ts` | GET, POST, PUT, DELETE |
| `src/app/api/portals/[id]/route.ts` | GET by ID, PUT, DELETE by ID |
| `src/app/dashboard/create-portal-dialog.tsx` | Client-side portal creation form |
| `src/app/dashboard/portal-list.tsx` | Portal list display |
