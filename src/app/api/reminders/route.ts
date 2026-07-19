import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { portal_id, recipient_email } = body

    if (!portal_id || !recipient_email) {
      return NextResponse.json(
        { error: 'ID du portail et email destinataire requis' },
        { status: 400 }
      )
    }

    // In production, this would call Brevo API to send the reminder email
    // For now, we'll just log it and create a reminder record
    const { error } = await supabase
      .from('reminder_logs')
      .insert({
        portal_id,
        recipient_email,
        sent_at: new Date().toISOString(),
        status: 'sent',
      })

    if (error) {
      return NextResponse.json(
        { error: 'Erreur lors de l\'enregistrement du rappel' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Rappel programmé avec succès'
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
