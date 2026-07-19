import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { portal_id, client_label } = body

    if (!portal_id) {
      return NextResponse.json({ error: 'ID du portail requis' }, { status: 400 })
    }

    // Generate unique link token
    const token = crypto.randomBytes(16).toString('hex')

    // Verify portal belongs to user
    const { data: portal } = await supabase
      .from('portals')
      .select('id')
      .eq('id', portal_id)
      .eq('user_id', user.id)
      .single()

    if (!portal) {
      return NextResponse.json({ error: 'Portail non trouvé ou accès refusé' }, { status: 404 })
    }

    const { data: link, error } = await supabase
      .from('portal_access_links')
      .insert({
        portal_id,
        token,
        client_label: client_label || null,
        reminder_schedule: '["3d","7d"]',
        reminders_enabled: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating link:', error)
      return NextResponse.json({ error: 'Erreur lors de la création du lien' }, { status: 500 })
    }

    return NextResponse.json({ 
      link: {
        ...link,
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/portal/${token}`
      }
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
