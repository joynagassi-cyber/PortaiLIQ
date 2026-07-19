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
    const { portal_id, label } = body

    if (!portal_id) {
      return NextResponse.json({ error: 'ID du portail requis' }, { status: 400 })
    }

    // Generate unique link token
    const token = crypto.randomBytes(16).toString('hex')

    const { data: link, error } = await supabase
      .from('sharing_links')
      .insert({
        portal_id,
        user_id: user.id,
        token,
        label: label || null,
      })
      .select()
      .single()

    if (error) {
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
