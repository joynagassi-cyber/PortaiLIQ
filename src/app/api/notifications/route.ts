import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendWelcomeEmail, sendSubmissionConfirmation } from '@/lib/brevo'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { type, portal_id, link_token, client_email, client_name } = body

    if (!type || !portal_id || !link_token) {
      return NextResponse.json(
        { error: 'Type, portal_id et link_token sont requis' },
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
      .eq('id', portal_id)
      .single()

    if (!portal) {
      return NextResponse.json({ error: 'Portail non trouvé' }, { status: 404 })
    }

    // Null-safe access
    const freelancerName = portal.user?.display_name || 'Freelance'
    const portalName = portal.name || 'Portail'
    const userId = portal.user_id || null

    // Send appropriate email based on type
    let emailSent = false
    
    if (type === 'welcome') {
      if (!client_email) {
        return NextResponse.json({ error: 'client_email est requis pour l\'email de bienvenue' }, { status: 400 })
      }

      const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/portal/${link_token}`
      
      emailSent = await sendWelcomeEmail({
        to: client_email,
        toName: client_name || 'Client',
        portalName,
        freelancerName,
        portalUrl,
      })
    } else if (type === 'submission_confirmation') {
      emailSent = await sendSubmissionConfirmation({
        to: client_email,
        toName: client_name || 'Client',
        portalName,
      })
    }

    if (!emailSent) {
      return NextResponse.json({ error: 'Échec de l\'envoi de l\'email' }, { status: 500 })
    }

    // Log activity
    await supabase
      .from('activity_log')
      .insert({
        user_id: userId,
        portal_id: portal.id,
        action: type === 'welcome' ? 'link_sent' : 'submission_received',
        metadata: {
          client_email: client_email,
          link_token: link_token,
          sent_at: new Date().toISOString()
        }
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
