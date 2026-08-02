# Spec: Templates & Starter Kits

> Freelancers create reusable field templates and apply pre-built starter kits by profession.

## Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/templates` | Required | List user's templates |
| POST | `/api/templates` | Required | Create template |
| DELETE | `/api/templates/:id` | Required | Delete template |
| GET | `/api/templates/:id` | Required | Get template details + items |
| POST | `/api/templates/:id/apply` | Required | Apply template to new portal |
| GET | `/api/starter-kits` | Required | List available starter kits |
| GET | `/api/starter-kits/:profession` | Required | Get specific starter kit |

## Starter Kits (Static Data)

5 pre-built kits. Each has 5 fields. Stored in code, not DB.

```typescript
// src/app/api/starter-kits/route.ts

const STARTER_KITS = {
  designer: {
    name: "Designer",
    items: [
      { label: "High-res Logo", itemType: "file", expectedFormat: "PNG, SVG", required: true },
      { label: "Color Palette", itemType: "text", required: true },
      { label: "Fonts Used", itemType: "text", required: false },
      { label: "Inspiration Links", itemType: "url", required: false },
      { label: "Project Brief", itemType: "text", required: true },
    ],
  },
  developer: {
    name: "Developer",
    items: [
      { label: "Repository Access", itemType: "url", required: true },
      { label: "Technical Docs", itemType: "file", expectedFormat: "PDF, MD", required: false },
      { label: "Tech Stack", itemType: "text", required: true },
      { label: "Hosting Environments", itemType: "url", required: false },
      { label: "Success Criteria", itemType: "text", required: true },
    ],
  },
  consultant: {
    name: "Consultant",
    items: [
      { label: "Project Context", itemType: "text", required: true },
      { label: "Stakeholders", itemType: "text", required: true },
      { label: "Estimated Budget", itemType: "number", required: false },
      { label: "Timeline", itemType: "date", required: true },
      { label: "Deliverables", itemType: "text", required: true },
    ],
  },
  coach: {
    name: "Coach",
    items: [
      { label: "Coaching Goals", itemType: "text", required: true },
      { label: "Availability", itemType: "text", required: true },
      { label: "Communication Preferences", itemType: "text", required: false },
      { label: "Professional Context", itemType: "text", required: false },
      { label: "Target Deadline", itemType: "date", required: false },
    ],
  },
  photographer: {
    name: "Photographer",
    items: [
      { label: "Session Type", itemType: "multiple_choice", choices: ["Wedding", "Portrait", "Event", "Product", "Other"], required: true },
      { label: "Session Date", itemType: "date", required: true },
      { label: "Preferred Location", itemType: "text", required: false },
      { label: "Visual Inspirations", itemType: "url", required: false },
      { label: "Expected Photo Count", itemType: "number", required: false },
    ],
  },
};
```

## Template Schema

```typescript
// DB: demand_templates + demand_template_items
// Zod: createTemplateSchema (in validation.ts)

export const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  professionCategory: z.string().max(50).optional(),
  items: z.array(createItemSchema), // createItemSchema from submissions spec
});
```

## API Responses

### GET /api/templates → 200 OK

```json
{
  "templates": [
    {
      "id": "uuid",
      "name": "Web Design Onboarding",
      "professionCategory": "designer",
      "itemCount": 5,
      "createdAt": "2026-07-21T10:00:00Z"
    }
  ]
}
```

### POST /api/templates → 201 Created

```json
{
  "template": {
    "id": "uuid",
    "name": "Web Design Onboarding",
    "professionCategory": "designer",
    "items": [
      { "id": "uuid", "label": "High-res Logo", "itemType": "file", ... }
    ]
  }
}
```

### POST /api/templates/:id/apply → 201 Created

Creates a new portal + copies all template items into it.

```json
{
  "portal": { "id": "uuid", "name": "New Portal" },
  "items": [
    { "id": "uuid", "label": "High-res Logo", "portalId": "uuid" }
  ]
}
```

## Business Logic

1. **Create template:** Validate name + items → insert template → insert each item → return template with items
2. **List templates:** Query demand_templates WHERE user_id = auth.user.id ORDER BY created_at DESC
3. **Apply template:** Create portal → for each template_item, create portal_item with same fields → return portal + items
4. **Delete template:** Cascade delete items → delete template

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Template with 0 items | 400 "Template must have at least one item" |
| Template name exceeds 100 chars | 400 Validation error |
| Applying template to a client profile | clientProfileId optional on apply |
| Starter kit profession not found | 404 "Profession not found" |
| Template contains multiple_choice without choices | 400 "choices required for multiple_choice type" |

## Files

| File | Role |
|------|------|
| `src/app/api/templates/route.ts` | GET, POST, DELETE templates |
| `src/app/api/templates/[id]/items/route.ts` | CRUD template items |
| `src/app/api/templates/[id]/apply/route.ts` | Apply template to new portal |
| `src/app/api/starter-kits/route.ts` | Static starter kits data |
| `src/app/templates/page.tsx` | Templates list page |
