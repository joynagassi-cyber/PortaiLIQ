# Spec: Cron Jobs & Reminders

> Scheduled tasks: automatic reminders and file cleanup.

## Routes

| Method | Path | Trigger | Description |
|--------|------|---------|-------------|
| POST | `/api/cron/reminders` | Cloudflare Cron | Send scheduled reminder emails |
| GET | `/api/cron/cleanup` | Cloudflare Cron | Delete expired files |

## Reminder Cron

### Trigger

Every 6 hours via Cloudflare Cron Trigger:
```
schedule: "0 */6 * * *"
```

### Logic

1. Query all `portal_access_links` WHERE `reminders_enabled = true`
2. For each link, parse `reminder_schedule` (e.g., `["3d", "7d"]`)
3. For each interval, calculate: `created_at + interval_days`
4. If `next_reminder <= now` AND `next_reminder > now - 6h` (within last cron window):
   a. Send reminder email via Brevo
   b. Log in `activity_log` with action `reminder_sent`
   c. Track sent reminders in a separate field to avoid duplicates

### Email Content

Same as manual reminder (see `emails.md` spec).

### Rate Limit

Max 10 reminder emails per link (prevents infinite loops).

## Cleanup Cron

### Trigger

Daily at midnight:
```
schedule: "0 0 * * *"
```

### Logic

1. Query submissions WHERE `submitted_at < NOW() - INTERVAL '30 days'`
2. For each submission with a `file_url` in R2:
   a. Delete file from R2 bucket
   b. Mark submission as deleted (soft delete: set status = 'expired')
3. Log cleanup count in activity_log

### Safety

- Never delete submissions without a file_url (text-only submissions are kept forever)
- Log how many files were deleted
- If R2 delete fails, skip and continue (don't block the cron)

## Error Handling

| Error | Behavior |
|-------|----------|
| Brevo API down | Log error, skip email, retry next cron window |
| R2 delete fails | Log error, skip file, continue |
| DB connection fails | Return 500, Cloudflare retries |
| Webhook secret invalid | Return 401, don't process |

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Reminder sent manually AND scheduled | Both send (no dedup needed — client wants reminders) |
| Link has no reminder schedule | Default to `["3d", "7d"]` |
| Cron runs while user is inactive | Still processes (reminders are for the portal, not user) |
| 30-day cleanup conflicts with compliance | Configurable via env: `CLEANUP_DAYS=30` |

## Files

| File | Role |
|------|------|
| `src/app/api/cron/reminders/route.ts` | Reminder cron handler |
| `src/app/api/cron/cleanup/route.ts` | Cleanup cron handler |
| `wrangler.toml` | Cron schedule configuration |
