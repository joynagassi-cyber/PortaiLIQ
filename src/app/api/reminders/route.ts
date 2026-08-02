import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendReminderEmail } from '@/lib/brevo'

/**
 * Manual reminder email
 * POST /api/reminders
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { linkToken, clientEmail, clientName } = body

    if (!linkToken || !clientEmail) {
      return NextResponse.json(
        { error: 'linkToken and clientEmail are required' },
        { status: 400 }
      )
    }

    // Get access link with portal details
    const { data: accessLink, error: linkError } = await supabase
      .from('portal_access_links')
      .select(`
        token,
        portal:portals(
          id,
          name,
          user_id
        )
      `)
      .eq('token', linkToken)
      .single()

    if (linkError || !accessLink) {
      return NextResponse.json({ error: 'Access link not found' }, { status: 404 })
    }

    const portal = accessLink.portal
    const freelancerName = user.user_metadata?.full_name || 'Freelancer'
    const portalName = portal?.name || 'Portal'
    const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/portal/${linkToken}`

    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      console.warn('NEXT_PUBLIC_SITE_URL not configured — portal URLs will be broken')
    }

    // Send reminder email
    const emailSent = await sendReminderEmail({
      to: clientEmail,
      toName: clientName || 'Client',
      portalName,
      freelancerName,
      portalUrl,
    })

    if (!emailSent) {
      console.warn('Reminder email failed to send')
    }

    // Log activity
    await supabase
      .from('activity_log')
      .insert({
        userId: portal?.user_id || user.id,
        portalId: portal?.id || null,
        action: 'reminder_sent',
        metadata: {
          clientEmail,
          linkToken,
          sentAt: new Date().toISOString(),
        },
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reminder error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
