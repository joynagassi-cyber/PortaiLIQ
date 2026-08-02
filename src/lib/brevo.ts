export interface EmailOptions {
  to: string
  toName?: string
  subject: string
  htmlContent: string
}

export interface WelcomeEmailOptions {
  to: string
  toName: string
  portalName: string
  freelancerName: string
  portalUrl: string
}

export interface SubmissionConfirmationOptions {
  to: string
  toName: string
  portalName: string
}

export interface ReminderEmailOptions {
  to: string
  toName: string
  portalName: string
  freelancerName: string
  portalUrl: string
}

export async function sendBrevoEmail(options: EmailOptions): Promise<boolean> {
  try {
    const apiKey = process.env.BREVO_API_KEY
    if (!apiKey) {
      console.warn('Brevo API key not configured')
      return false
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME || 'PortaiLIQ',
          email: process.env.BREVO_SENDER_EMAIL || 'noreply.portaliq@gmail.com',
        },
        to: [{
          email: options.to,
          name: options.toName,
        }],
        subject: options.subject,
        htmlContent: options.htmlContent,
      }),
    })

    return response.ok
  } catch (error) {
    console.error('Brevo send error:', error)
    return false
  }
}

export async function sendWelcomeEmail(options: WelcomeEmailOptions): Promise<boolean> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #0A0F1A; max-width: 600px; margin: 0 auto;">
      <div style="background: #3B82F6; padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Welcome!</h1>
      </div>
      <div style="padding: 30px; background: #F8FAFC;">
        <p>Hello ${options.toName},</p>
        <p>${options.freelancerName} has invited you to complete the portal <strong>${options.portalName}</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${options.portalUrl}"
             style="background: #3B82F6; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 8px; font-weight: 600;
                    display: inline-block;">
            Access Portal
          </a>
        </div>
        <p style="font-size: 14px; color: #6B7280;">
          If you have questions, contact ${options.freelancerName}.
        </p>
      </div>
    </body>
    </html>
  `

  return sendBrevoEmail({
    to: options.to,
    toName: options.toName,
    subject: `Welcome to ${options.portalName}`,
    htmlContent,
  })
}

export async function sendSubmissionConfirmation(options: SubmissionConfirmationOptions): Promise<boolean> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #0A0F1A; max-width: 600px; margin: 0 auto;">
      <div style="background: #3B82F6; padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Submission Confirmed</h1>
      </div>
      <div style="padding: 30px; background: #F8FAFC;">
        <p>Thank you, ${options.toName}!</p>
        <p>Your submission for <strong>${options.portalName}</strong> has been received.</p>
        <p>The freelancer will review your responses and contact you if needed.</p>
      </div>
    </body>
    </html>
  `

  return sendBrevoEmail({
    to: options.to,
    toName: options.toName,
    subject: `Confirmation: ${options.portalName}`,
    htmlContent,
  })
}

export async function sendReminderEmail(options: ReminderEmailOptions): Promise<boolean> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #0A0F1A; max-width: 600px; margin: 0 auto;">
      <div style="background: #3B82F6; padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Friendly Reminder</h1>
      </div>
      <div style="padding: 30px; background: #F8FAFC;">
        <p>Hi ${options.toName},</p>
        <p>This is a reminder that <strong>${options.freelancerName}</strong> is waiting for your responses for <strong>${options.portalName}</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${options.portalUrl}"
             style="background: #3B82F6; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 8px; font-weight: 600;
                    display: inline-block;">
            Complete Portal
          </a>
        </div>
      </div>
    </body>
    </html>
  `

  return sendBrevoEmail({
    to: options.to,
    toName: options.toName,
    subject: `Reminder: ${options.portalName}`,
    htmlContent,
  })
}
