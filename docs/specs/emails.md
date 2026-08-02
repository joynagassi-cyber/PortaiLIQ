# Spec: Email Notifications (Brevo)

> Transactional emails via Brevo SMTP. Three email types: welcome, submission confirmation, reminder.

## Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/reminders/send` | Required | Send manual reminder email |
| POST | `/api/cron/reminders` | Cron secret | Trigger scheduled reminders |

## Email Types

### 1. Welcome Email (on link creation)

**Trigger:** Freelancer creates a portal access link

**Recipient:** Client email (provided by freelancer)

**Subject:** `You've been invited to complete: {portalName}`

**Template:**
```html
<!DOCTYPE html>
<html>
<head><title>Welcome to {portalName}</title></head>
<body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: var(--primary); color: white; padding: 24px; text-align: center;">
    <h1>Welcome!</h1>
  </div>
  <div style="padding: 24px; background: #f8f9fa;">
    <p>Hello {clientName},</p>
    <p>{freelancerName} has invited you to complete the portal <strong>{portalName}</strong>.</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="{portalUrl}" style="background: var(--primary); color: white; padding: 12px 24px;
           text-decoration: none; border-radius: 8px; display: inline-block;">
        Access Portal
      </a>
    </div>
    <p style="font-size: 14px; color: var(--muted-foreground);">
      This link will expire on {expiresAt || "no expiration"}.
    </p>
  </div>
</body>
</html>
```

**Design rules:** Blue primary color only. No gradients. System fonts.

### 2. Submission Confirmation

**Trigger:** Client successfully submits portal responses

**Recipient:** Client email (if provided during submission)

**Subject:** `Confirmation: Your submission for {portalName} has been received`

**Template:**
```html
<p>Thank you, {clientName}!</p>
<p>Your submission for <strong>{portalName}</strong> has been received successfully.</p>
<p>The freelancer will review your responses and contact you if needed.</p>
```

### 3. Reminder Email

**Trigger:** Manual (freelancer clicks "Remind") or scheduled (cron D+3, D+7)

**Recipient:** Client email

**Subject:** `Reminder: Please complete {portalName}`

**Template:**
```html
<p>Hi {clientName},</p>
<p>This is a friendly reminder that {freelancerName} is still waiting for your responses
   for <strong>{portalName}</strong>.</p>
<p>Please click the link below to complete your submission:</p>
<a href="{portalUrl}">Complete Portal</a>
```

## Brevo API Integration

```typescript
// src/lib/brevo.ts

interface EmailOptions {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
}

export async function sendBrevoEmail(options: EmailOptions): Promise<boolean> {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY!,
    },
    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_SENDER_NAME || "PortaiLIQ",
        email: process.env.BREVO_SENDER_EMAIL || "noreply.portaliq@gmail.com",
      },
      to: [{ email: options.to, name: options.toName }],
      subject: options.subject,
      htmlContent: options.htmlContent,
    }),
  });
  return response.ok;
}
```

## Rate Limiting

- Brevo free tier: 300 emails/day
- If limit exceeded: log warning, skip email, return success (non-blocking)
- Per-user limit: 10 reminder emails per portal link

## Error Handling

| Error | Behavior |
|-------|----------|
| BREVO_API_KEY not set | Log warning, return false silently |
| Brevo API returns 4xx | Log error, return false |
| Brevo API returns 5xx | Retry once after 2s, then log and give up |
| Invalid email format | Log error, don't send |

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Client email not provided | No welcome email sent (freelancer shares link manually) |
| Reminder sent to same client twice | Allowed (different schedule intervals) |
| Brevo rate limit hit | Queue for retry, log warning |
| Email bounce | Log to activity_log, don't retry |

## Files

| File | Role |
|------|------|
| `src/lib/brevo.ts` | Brevo client + email templates |
| `src/app/api/reminders/route.ts` | Manual reminder endpoint |
| `src/app/api/cron/reminders/route.ts` | Scheduled reminder cron |
