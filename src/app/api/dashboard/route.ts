import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Fetch user's stats
    const [{ data: portals }, { data: submissions }] = await Promise.all([
      supabase.from('portals').select('id, name, status').eq('user_id', user.id),
      supabase.from('submissions').select('id, status').eq('portal_id', user.id), // Note: this needs adjustment
    ])

    return NextResponse.json({
      totalPortals: portals?.length || 0,
      activePortals: portals?.filter(p => p.status === 'published').length || 0,
      totalSubmissions: submissions?.length || 0,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
