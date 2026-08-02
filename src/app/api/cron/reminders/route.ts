import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendReminderEmail } from '@/lib/brevo'

/**
 * Scheduled reminder cron — triggered by Cloudflare Cron Trigger
 * GET /api/cron/reminders?secret={CRON_SECRET}
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get all portals with reminders enabled
    const { data: portals, error: portalsError } = await supabase
      .from('portals')
      .select(`
        id,
        user_id,
        access_links:portal_access_links(
          id,
          token,
          client_label,
          reminders_enabled,
          reminder_schedule,
          created_at
        )
      `)

    if (portalsError) {
      return NextResponse.json({ error: 'Query failed' }, { status: 500 })
    }

    const remindersToSend: Array<{
      portalId: string
      userId: string
      linkToken: string
      clientLabel: string | null
      days: number
    }> = []

    if (portals) {
      for (const portal of portals) {
        for (const link of portal.access_links || []) {
          if (!link.reminders_enabled) continue

          // Parse reminder schedule
          let schedule: string[] = []
          try {
            schedule = JSON.parse(link.reminder_schedule || '["3d","7d"]')
          } catch {
            schedule = ['3d', '7d']
          }

          for (const interval of schedule) {
            const days = parseInt(interval.replace('d', ''), 10)
            if (isNaN(days)) continue

            const createdDate = new Date(link.created_at)
            const nextReminder = new Date(createdDate.getTime() + days * 24 * 60 * 60 * 1000)

            const now = new Date()
            if (nextReminder <= now && nextReminder > new Date(now.getTime() - 24 * 60 * 60 * 1000)) {
              remindersToSend.push({
                portalId: portal.id,
                userId: portal.user_id,
                linkToken: link.token,
                clientLabel: link.client_label,
                days,
              })
            }
          }
        }
      }
    }

    // In production: send emails for each reminder
    // for (const reminder of remindersToSend) {
    //   await sendReminderEmail({...})
    // }

    return NextResponse.json({
      reminders_to_send: remindersToSend,
      count: remindersToSend.length,
    })
  } catch (error) {
    console.error('Cron reminders error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
