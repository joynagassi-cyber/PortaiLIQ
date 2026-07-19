import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/brevo'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { link_token, client_email, client_name } = body

    if (!link_token || !client_email) {
      return NextResponse.json(
        { error: 'link_token et client_email sont requis' },
        { status: 400 }
      )
    }

    // Get access link with portal details
    const { data: accessLink, error: linkError } = await supabase
      .from('portal_access_links')
      .select(`
        id,
        portal:portals(
          id,
          name,
          user:users(display_name, email)
        )
      `)
      .eq('token', link_token)
      .single()

    if (linkError || !accessLink) {
      return NextResponse.json({ error: 'Lien d\'accès non trouvé' }, { status: 404 })
    }

    const portal = accessLink.portal
    
    // Null-safe access to nested data
    const freelancerName = portal?.user?.display_name || 'Freelance'
    const portalName = portal?.name || 'Portail'
    
    // Send reminder email
    const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/portal/${link_token}`
    
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      console.warn('NEXT_PUBLIC_SITE_URL not configured — portal URLs will be broken')
    }
    
    const emailSent = await sendWelcomeEmail({
      to: client_email,
      toName: client_name || 'Client',
      portalName,
      freelancerName,
      portalUrl,
    })

    if (!emailSent) {
      return NextResponse.json({ error: 'Échec de l\'envoi de l\'email de relance' }, { status: 500 })
    }

    // Log activity
    await supabase
      .from('activity_log')
      .insert({
        user_id: portal?.user_id || null,
        portal_id: portal?.id || null,
        action: 'reminder_sent',
        metadata: {
          client_email: client_email,
          link_token: link_token,
          sent_at: new Date().toISOString()
        }
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending reminder:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
