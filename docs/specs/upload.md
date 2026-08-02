# Spec: File Upload (Cloudflare R2)

> Clients upload files directly to Cloudflare R2 via presigned URLs. Server never touches file bytes.

## Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/upload/presign` | Required | Get presigned URL for upload |
| POST | `/api/upload/complete` | Required | Confirm upload + store metadata |

## Flow

```
1. Client selects file in portal form
2. Frontend calls POST /api/upload/presign { fileName, fileType, portalItemId }
3. Server validates file type + size → generates presigned URL via R2 SDK → returns { uploadUrl, key }
4. Frontend uploads file directly: PUT uploadUrl { file }
5. Frontend calls POST /api/upload/complete { key, portalItemId, fileName, fileSize, fileType }
6. Server records metadata in submissions table
```

## Zod Schemas

```typescript
export const presignUploadSchema = z.object({
  fileName: z.string().max(255),
  fileType: z.string().max(50),
  portalItemId: z.string().uuid(),
  expectedFormat: z.string().max(50).optional(),
});

export const completeUploadSchema = z.object({
  key: z.string().min(1),
  portalItemId: z.string().uuid(),
  fileName: z.string().max(255),
  fileSize: z.number().int().positive().max(10 * 1024 * 1024), // 10MB
  fileType: z.string().max(50),
});
```

## Validation Rules

| Rule | Limit |
|------|-------|
| Max file size | 10 MB |
| Max files per submission | 1 (one file per item) |
| Allowed types | image/jpeg, image/png, image/gif, image/webp, application/pdf, text/plain, text/csv, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet |
| Filename sanitization | Remove special chars, max 255 bytes |

## Expected Format Warning

If the portal item specifies `expectedFormat` (e.g., "PNG, SVG") and the uploaded file doesn't match, return a warning in the presign response:

```json
{
  "uploadUrl": "https://...",
  "key": "uploads/uuid/filename.png",
  "warning": "Expected format: PNG, SVG. Uploaded: PNG. This is acceptable."
}
```

If format is incompatible:

```json
{
  "uploadUrl": "https://...",
  "key": "uploads/uuid/filename.jpg",
  "warning": "Expected format: PNG, SVG. Uploaded: JPG. This may not meet requirements."
}
```

## API Responses

### POST /api/upload/presign → 200 OK

```json
{
  "uploadUrl": "https://{bucket}.r2.cloudflarestorage.com/{key}?X-Amz-...",
  "key": "portaliq/uploads/{userId}/{timestamp}-{sanitized-filename}",
  "warning": null
}
```

### POST /api/upload/complete → 200 OK

```json
{
  "success": true,
  "fileUrl": "https://{bucket}.r2.cloudflarestorage.com/{key}",
  "fileName": "logo.png",
  "fileSize": 245760,
  "fileType": "image/png"
}
```

## Business Logic

1. **Presign:** Validate file type → check size ≤ 10MB → generate sanitized key → call R2 `put()` with `write({ presign: true })` → return presigned URL + key
2. **Complete:** Validate key exists in R2 → record metadata → optionally trigger AI file verification
3. **R2 Bucket:** `portaliq-uploads` (or configured via env)
4. **Object key pattern:** `{userId}/{portalId}/{timestamp}-{sanitized-filename}`

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| File type not in allowed list | 400 "File type not allowed" |
| File size > 10MB | 400 "File too large (max 10MB)" |
| R2 presign generation fails | 500 "Upload service unavailable" |
| R2 upload fails (network error) | Client retries presign → new URL |
| Filename with special chars | Sanitized: `file name (test).txt` → `file_name_test_.txt` |
| Duplicate filename in same upload | Timestamp prefix ensures uniqueness |

## Cloudflare R2 SDK Usage

```typescript
import { S3Client } from "@cloudflare/workers-types";

const r2 = new S3Client({
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  region: "auto",
});
```

## Files

| File | Role |
|------|------|
| `src/app/api/upload/presign/route.ts` | Generate presigned URL |
| `src/app/api/upload/complete/route.ts` | Confirm upload + store metadata |
| `src/lib/r2.ts` | R2 client singleton + helpers |
