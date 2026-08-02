import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendWelcomeEmail, sendSubmissionConfirmation } from '@/lib/brevo'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { type, portalId, linkToken, clientEmail, clientName } = body

    if (!type || !portalId || !linkToken) {
      return NextResponse.json(
        { error: 'Type, portalId, and linkToken are required' },
        { status: 400 }
      )
    }

    // Get portal details
    const { data: portal } = await supabase
      .from('portals')
      .select(`
        *,
        user:users(display_name, email)
      `)
      .eq('id', portalId)
      .single()

    if (!portal) {
      return NextResponse.json({ error: 'Portal not found' }, { status: 404 })
    }

    // Null-safe access
    const freelancerName = portal.user?.display_name || 'Freelancer'
    const portalName = portal.name || 'Portal'
    const userId = portal.user_id || null

    // Send appropriate email based on type
    let emailSent = false

    if (type === 'welcome') {
      if (!clientEmail) {
        return NextResponse.json({ error: 'clientEmail is required for welcome email' }, { status: 400 })
      }

      const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/portal/${linkToken}`

      emailSent = await sendWelcomeEmail({
        to: clientEmail,
        toName: clientName || 'Client',
        portalName,
        freelancerName,
        portalUrl,
      })
    } else if (type === 'submission_confirmation') {
      emailSent = await sendSubmissionConfirmation({
        to: clientEmail,
        toName: clientName || 'Client',
        portalName,
      })
    }

    if (!emailSent) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    // Log activity
    await supabase
      .from('activity_log')
      .insert({
        userId,
        portalId: portal.id,
        action: type === 'welcome' ? 'link_sent' : 'submission_received',
        metadata: {
          clientEmail,
          linkToken,
          sentAt: new Date().toISOString(),
        },
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
