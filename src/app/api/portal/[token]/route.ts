import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const supabase = await createClient()
    const { token: portalToken } = await params

    // Fetch portal by token
    const { data: portal, error: portalError } = await supabase
      .from('portals')
      .select('*')
      .eq('token', portalToken)
      .eq('status', 'published')
      .single()

    if (portalError || !portal) {
      return NextResponse.json(
        { error: 'Portail non trouvé ou non publié' },
        { status: 404 }
      )
    }

    // Get freelancer name from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', portal.user_id)
      .single()

    // Get portal items
    const { data: items, error: itemsError } = await supabase
      .from('portal_items')
      .select('*')
      .eq('portal_id', portal.id)
      .order('sort_order', { ascending: true })

    if (itemsError) {
      return NextResponse.json(
        { error: 'Erreur lors du chargement des items' },
        { status: 500 }
      )
    }

    // Get access links for this portal
    const { data: accessLinks, error: accessError } = await supabase
      .from('portal_access_links')
      .select('token')
      .eq('portal_id', portal.id)

    if (accessError) {
      return NextResponse.json(
        { error: 'Erreur lors du chargement des liens d\'accès' },
        { status: 500 }
      )
    }

    // Combine data
    const portalData = {
      ...portal,
      freelancer_name: profile?.full_name || portal.freelancer_name || 'Freelance',
      items: items || [],
      access_link_tokens: accessLinks?.map((link: any) => link.token) || [],
    }

    return NextResponse.json({ portal: portalData })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
