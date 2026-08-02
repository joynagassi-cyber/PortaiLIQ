# Spec: Portal Items

> Fields within a portal. Each item has a type (text, file, email, phone, number, url, date, multiple_choice).

## Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/portals/:id/items` | Required | List items for a portal |
| POST | `/api/portals/:id/items` | Required | Add item to portal |
| PUT | `/api/portals/:id/items/:itemId` | Required | Update portal item |
| DELETE | `/api/portals/:id/items/:itemId` | Required | Remove item from portal |

## Zod Schemas

```typescript
export const createItemSchema = z.object({
  label: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  itemType: z.enum(['text', 'file', 'email', 'phone', 'number', 'url', 'date', 'multiple_choice']),
  expectedFormat: z.string().max(50).optional(),
  required: z.boolean().default(true),
  choices: z.array(z.string()).optional(), // for multiple_choice
  sortOrder: z.number().int().min(0).default(0),
});

export const updateItemSchema = createItemSchema.partial();
```

## API Responses

### POST /api/portals/:id/items → 201 Created

```json
{
  "item": {
    "id": "uuid",
    "portalId": "uuid",
    "label": "Company Logo",
    "itemType": "file",
    "expectedFormat": "PNG, SVG",
    "required": true,
    "sortOrder": 0,
    "createdAt": "2026-07-21T10:00:00Z"
  }
}
```

### GET /api/portals/:id/items → 200 OK

```json
{
  "items": [
    {
      "id": "uuid",
      "label": "Company Logo",
      "itemType": "file",
      "expectedFormat": "PNG, SVG",
      "required": true,
      "sortOrder": 0
    },
    {
      "id": "uuid2",
      "label": "Project Brief",
      "itemType": "text",
      "required": true,
      "sortOrder": 1
    }
  ]
}
```

## Business Logic

1. **Create:** Validate schema → check user owns portal → insert item → return item
2. **List:** Query items WHERE portal_id = :id ORDER BY sort_order ASC
3. **Update:** Validate schema → check user owns portal → UPDATE item → return updated item
4. **Delete:** Check user owns portal → DELETE item → return success

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Adding item to non-existent portal | 404 Portal not found |
| Adding item to portal owned by another user | 403 Forbidden |
| Multiple_choice without choices | 400 Validation error: "choices required for multiple_choice type" |
| Sort order negative | 400 Validation error: "sort_order must be >= 0" |

## Files

| File | Role |
|------|------|
| `src/app/api/portals/[id]/items/route.ts` | GET, POST items for portal |
| `src/app/api/portals/[id]/items/[itemId]/route.ts` | PUT, DELETE individual item |
