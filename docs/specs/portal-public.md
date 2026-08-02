# Spec: Public Portal (Client-Facing)

> Public page where clients fill out portal forms. No authentication required. Token-based access.

## Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/portal/:token` | Public | Portal form page |
| GET | `/portal/:token/status` | Public | Submission status page |
| GET | `/api/portal/:token` | Public | Portal data API |

## Flow

```
1. Client receives link: https://portaliq.com/portal/{accessToken}
2. GET /api/portal/{accessToken} → validates token, returns portal + items
3. Renders dynamic form based on item types
4. Client fills texts + uploads files
5. POST /api/submissions → creates submission records
6. Shows confirmation page
```

## Portal Data API

### GET /api/portal/:token → 200 OK

```json
{
  "portal": {
    "id": "uuid",
    "name": "Onboarding — Acme Corp",
    "description": "Please provide the following for our project kickoff",
    "logoUrl": null,
    "freelancerName": "Jane Smith",
    "items": [
      {
        "id": "item-uuid-1",
        "label": "Company Logo",
        "description": "High-resolution PNG or SVG",
        "itemType": "file",
        "expectedFormat": "PNG, SVG",
        "required": true,
        "sortOrder": 0
      },
      {
        "id": "item-uuid-2",
        "label": "Project Brief",
        "description": "Describe your project goals",
        "itemType": "text",
        "required": true,
        "sortOrder": 1
      }
    ],
    "accessLinkToken": "uuid"
  }
}
```

## Validation

1. Token must exist in `portal_access_links` table
2. Portal must exist and be linked to the access link
3. Portal status must be 'active'
4. If portal has `expires_at`, check it hasn't passed
5. If `reminders_enabled` is false, still allow access (just don't send reminders)

## Portal Form Page

### Component: `src/app/portal/[token]/page.tsx`

Renders dynamically based on `items`:

| item_type | UI Component |
|-----------|-------------|
| `text` | `<Textarea>` with placeholder |
| `email` | `<Input type="email">` |
| `phone` | `<Input type="tel">` |
| `number` | `<Input type="number">` |
| `url` | `<Input type="url">` |
| `date` | `<Input type="date">` |
| `file` | File input with upload progress + format warning |
| `multiple_choice` | `<select>` with choices from item.choices |

### Form Validation (Client)

- Required fields must have a value
- File fields must have an uploaded file
- Email/phone/URL/date fields validated by HTML5 input type
- On submit: collect all answers → POST to `/api/submissions`

### Submission Flow

```typescript
// Client-side form state
const [formData, setFormData] = useState<Record<string, any>>({})
const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({})

// On file selection
const handleFileUpload = async (itemId: string, file: File) => {
  // 1. Request presigned URL from server
  const presign = await fetch('/api/upload/presign', {
    method: 'POST',
    body: JSON.stringify({ fileName: file.name, fileType: file.type, portalItemId: itemId }),
  })
  const { uploadUrl, key, warning } = await presign.json()
  
  // 2. Upload directly to R2
  await fetch(uploadUrl, { method: 'PUT', body: file })
  
  // 3. Complete upload
  await fetch('/api/upload/complete', {
    method: 'POST',
    body: JSON.stringify({ key, portalItemId: itemId, fileName: file.name, fileSize: file.size, fileType: file.type }),
  })
  
  // 4. Store file URL in form data
  setFormData(prev => ({ ...prev, [itemId]: { uploaded: true, fileUrl: key } }))
}

// On submit
const handleSubmit = async () => {
  const answers = Object.entries(formData).reduce((acc, [itemId, data]) => {
    acc[itemId] = data
    return acc
  }, {} as Record<string, any>)
  
  await fetch('/api/submissions', {
    method: 'POST',
    body: JSON.stringify({ portalToken, answers }),
  })
}
```

## Status Page

### GET /portal/:token/status → 200 OK

Shows:
- Portal name
- Total items
- Completed items (green checkmark)
- Pending items (yellow clock)
- List of submissions with status badges

```
┌─────────────────────────────────────┐
│  Portal: Onboarding — Acme Corp     │
│                                     │
│  Total: 5    ✓ Completed: 3    ⏳  │
│                                     │
│  ☑ Company Logo          (file)     │
│  ☑ Project Brief         (text)     │
│  ☑ Contact Email         (email)    │
│  ⏳ Timeline             (date)     │
│  ⏳ Budget Range         (number)   │
└─────────────────────────────────────┘
```

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Invalid/expired token | 404 "Portal not found" |
| Portal is archived | 403 "This portal is no longer accepting submissions" |
| Portal is completed | 403 "This portal has been completed" |
| Client refreshes mid-form | Form data lost (no localStorage persistence) → acceptable for MVP |
| File upload fails | Show error toast, allow retry |
| Multiple tabs open with same token | Race condition on submissions → handled by DB (idempotent inserts) |
| Browser back button after submit | Shows form again, not confirmation → use `router.refresh()` after submit |

## Files

| File | Role |
|------|------|
| `src/app/portal/[token]/page.tsx` | Portal form page |
| `src/app/portal/[token]/status/page.tsx` | Status page |
| `src/app/api/portal/[token]/route.ts` | Portal data API |
