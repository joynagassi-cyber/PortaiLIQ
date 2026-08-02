# Spec: CSV Export

> Freelancers export all portal submissions as a downloadable CSV file.

## Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/exports/csv` | Required | Download CSV for a portal |

## API

### GET /api/exports/csv?portalId={uuid} → 200 OK

Returns CSV file with Content-Disposition header.

### CSV Structure

Headers:
```
Submission ID, Client Name, Client Email, Submitted At, Status,
{item1_label}, {item2_label}, {item3_label}, ...
```

Rows:
```
uuid-1, John Doe, john@example.com, 2026-07-21T10:00:00Z, received,
"Our target is SaaS companies", https://r2.../logo.png, Q1 2027, 50000
```

### Business Logic

1. **Auth check** → user must be logged in
2. **Ownership check** → portal must belong to user
3. **Fetch submissions** → JOIN submissions → portal_items WHERE portal_id = :portalId
4. **Build CSV** → headers from portal_items, rows from submissions
5. **CSV injection protection** → escape cells starting with `=`, `+`, `-`, `@` with leading `'`
6. **Return** → `Content-Type: text/csv`, `Content-Disposition: attachment; filename="portal-{id}-{date}.csv"`

### CSV Injection Protection

```typescript
function protectCell(value: string): string {
  if (/^[\=\+\-\@]/.test(value)) {
    return "'" + value;
  }
  return value;
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 401 | Unauthorized |
| 403 | Portal not found or access denied |
| 404 | No submissions found for this portal |
| 500 | Export failed |

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Portal has no submissions | 404 "No submissions found" |
| Portal has 1000+ submissions | CSV still generated (streaming not needed for MVP) |
| Submission has null values | Empty string in CSV cell |
| Text answer contains commas | Wrapped in double quotes (RFC 4180) |
| Text answer contains double quotes | Escaped as `""` (RFC 4180) |
| File answer (no text) | Cell contains file URL |

## Files

| File | Role |
|------|------|
| `src/app/api/exports/csv/route.ts` | CSV export endpoint |
