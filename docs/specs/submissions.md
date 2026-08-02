# Spec: Submissions

> Clients submit responses to portal items via public link. No authentication required.

## Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/submissions` | Public (token-validated) | Submit portal responses |
| GET | `/api/submissions/:portalId` | Required (owner) | View submissions for a portal |

## Flow

```
Client opens /portal/{token}
  → GET /api/portal/{token} → gets portal + items
  → Fills form (texts + file uploads)
  → POST /api/submissions → creates submission records
  → Gets 200 OK + confirmation
  → Email confirmation sent via Brevo
```

## Zod Schemas

```typescript
export const submissionItemSchema = z.object({
  portalItemId: z.string().uuid(),
  contentText: z.string().max(10000).optional(),
  fileUrl: z.string().url().optional(),
  fileName: z.string().max(255).optional(),
  fileSize: z.number().int().positive().optional(),
  fileType: z.string().max(50).optional(),
});

export const submitPortalSchema = z.object({
  portalToken: z.string().min(1),
  linkToken: z.string().uuid().optional(),
  clientName: z.string().max(100).optional(),
  clientEmail: z.string().email().optional(),
  answers: z.record(z.union([z.string(), submissionItemSchema])).min(1),
});
```

## API Request Body

```json
{
  "portalToken": "abc123...",
  "linkToken": "uuid",
  "clientName": "John Doe",
  "clientEmail": "john@example.com",
  "answers": {
    "item-uuid-1": {
      "contentText": "Our target market is SaaS companies with 50+ employees"
    },
    "item-uuid-2": {
      "fileUrl": "https://r2.cloudflarestorage.com/...",
      "fileName": "logo.png",
      "fileSize": 245760,
      "fileType": "image/png"
    }
  }
}
```

## API Responses

### POST /api/submissions → 200 OK

```json
{
  "success": true,
  "submissionIds": ["uuid1", "uuid2"],
  "message": "Responses submitted successfully"
}
```

### POST /api/submissions → 400 Bad Request

```json
{
  "error": "Missing required fields",
  "missing": ["Company Logo", "Project Brief"]
}
```

### POST /api/submissions → 404 Not Found

```json
{
  "error": "Portal not found or not active"
}
```

## Business Logic

1. **Validate portal token** → find portal by token, check status = 'active'
2. **Validate link token** (if provided) → find access link for this portal
3. **Validate all required fields** → check each required item has a non-empty answer
4. **Create submissions** → insert one record per portal_item into `submissions` table
5. **Send confirmation email** → Brevo `sendSubmissionConfirmation()` if clientEmail provided
6. **Trigger AI checks** → if all items submitted, call AI summary (async, non-blocking)
7. **Return success** → list of submission IDs

## Rate Limiting

- **Public endpoint** — must be rate-limited
- Limit: 10 submissions per portal token per hour
- Implemented via Cloudflare KV counter
- If exceeded: 429 Too Many Requests

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Portal is archived/completed | 403 Portal is not accepting submissions |
| Required field missing | 400 + list of missing fields |
| File answer without file_url (for file-type items) | 400 "File upload required" |
| Submission from same client twice | Allowed (client can resubmit) |
| AI summary fails | Logged in ai_call_logs, submission still succeeds |
| Email send fails | Logged, submission still succeeds (non-blocking) |

## Files

| File | Role |
|------|------|
| `src/app/api/submissions/route.ts` | POST (submit), GET (list for owner) |
| `src/app/portal/[token]/page.tsx` | Client portal form (renders items dynamically) |
