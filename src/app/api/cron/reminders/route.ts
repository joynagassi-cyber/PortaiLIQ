import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/brevo'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { portal_id } = body

    if (!portal_id) {
      return NextResponse.json({ error: 'portal_id est requis' }, { status: 400 })
    }

    // Verify portal belongs to user
    const { data: portal } = await supabase
      .from('portals')
      .select('id')
      .eq('id', portal_id)
      .eq('user_id', user.id)
      .single()

    if (!portal) {
      return NextResponse.json({ error: 'Portail non trouvé' }, { status: 404 })
    }

    // Get all access links for this portal
    const { data: accessLinks } = await supabase
      .from('portal_access_links')
      .select(`
        id,
        token,
        client_label,
        reminders_enabled,
        reminder_schedule,
        created_at
      `)
      .eq('portal_id', portal_id)

    if (!accessLinks || accessLinks.length === 0) {
      return NextResponse.json({ message: 'Aucun lien d\'accès trouvé' })
    }

    const reminders = []

    for (const link of accessLinks) {
      if (!link.reminders_enabled) {
        continue
      }

      // Parse reminder schedule
      let schedule: string[] = []
      try {
        schedule = JSON.parse(link.reminder_schedule || '["3d","7d"]')
      } catch {
        schedule = ['3d', '7d']
      }

      // Calculate next reminder based on schedule and creation date
      for (const interval of schedule) {
        const days = parseInt(interval.replace('d', ''))
        if (isNaN(days)) continue

        const createdDate = new Date(link.created_at)
        const nextReminder = new Date(createdDate.getTime() + days * 24 * 60 * 60 * 1000)
        
        // If next reminder is in the past and we haven't sent it yet
        if (nextReminder < new Date()) {
          // In a real implementation, you would:
          // 1. Check if reminder was already sent
          // 2. Send the reminder email
          // 3. Update the reminder status
          
          reminders.push({
            link_token: link.token,
            client_label: link.client_label,
            days: days,
            next_reminder: nextReminder.toISOString(),
          })
        }
      }
    }

    return NextResponse.json({ reminders })
  } catch (error) {
    console.error('Error calculating reminders:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Cron endpoint for Cloudflare Cron Triggers — public but requires secret
export async function GET(request: Request) {
  try {
    // Verify cron secret (not user auth)
    const secret = request.headers.get('x-cron-secret')
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const supabase = await createClient()
    
    // Get all portals with reminders enabled
    const { data: portals } = await supabase
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

    if (!portals) {
      return NextResponse.json({ message: 'Aucun portail trouvé' })
    }

    const remindersToSend = []

    for (const portal of portals) {
      for (const link of portal.access_links || []) {
        if (!link.reminders_enabled) {
          continue
        }

        // Parse reminder schedule
        let schedule: string[] = []
        try {
          schedule = JSON.parse(link.reminder_schedule || '["3d","7d"]')
        } catch {
          schedule = ['3d', '7d']
        }

        // Calculate next reminder based on schedule and creation date
        for (const interval of schedule) {
          const days = parseInt(interval.replace('d', ''))
          if (isNaN(days)) continue

          const createdDate = new Date(link.created_at)
          const nextReminder = new Date(createdDate.getTime() + days * 24 * 60 * 60 * 1000)
          
          // Check if it's time to send reminder
          const now = new Date()
          if (nextReminder <= now && nextReminder > new Date(now.getTime() - 24 * 60 * 60 * 1000)) {
            remindersToSend.push({
              portal_id: portal.id,
              user_id: portal.user_id,
              link_token: link.token,
              client_label: link.client_label,
              days: days,
            })
          }
        }
      }
    }

    // In a real implementation, you would:
    // 1. Send emails for each reminder
    // 2. Update the reminder status in the database
    // 3. Log the activity

    return NextResponse.json({ 
      reminders_to_send: remindersToSend,
      count: remindersToSend.length
    })
  } catch (error) {
    console.error('Error in cron job:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
