import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { portal_token, items_data } = body

    if (!portal_token || !items_data) {
      return NextResponse.json(
        { error: 'Token du portail et données requis' },
        { status: 400 }
      )
    }

    // Verify portal exists and is published
    const { data: portal } = await supabase
      .from('portals')
      .select('id')
      .eq('token', portal_token)
      .eq('status', 'published')
      .single()

    if (!portal) {
      return NextResponse.json({ error: 'Portail invalide' }, { status: 404 })
    }

    // Create submission
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        portal_id: portal.id,
        items_data,
      })
      .select()
      .single()

    if (submissionError) {
      console.error('Submission error:', submissionError)
      return NextResponse.json(
        { error: 'Erreur lors de la soumission' },
        { status: 500 }
      )
    }

    // Trigger reminder email (async)
    // In production, this would call the reminders API

    return NextResponse.json({ 
      submission,
      message: 'Soumission enregistrée avec succès !'
    }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
