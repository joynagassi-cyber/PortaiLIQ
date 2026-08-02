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
      .eq('status', 'active')
      .single()

    if (portalError || !portal) {
      return NextResponse.json(
        { error: 'Portal not found or not active' },
        { status: 404 }
      )
    }

    // Get freelancer name from users table
    const { data: userProfile } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', portal.userId)
      .single()

    // Get portal items
    const { data: items, error: itemsError } = await supabase
      .from('portal_items')
      .select('*')
      .eq('portal_id', portal.id)
      .order('sort_order', { ascending: true })

    if (itemsError) {
      return NextResponse.json(
        { error: 'Failed to load items' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      portal: {
        ...portal,
        freelancerName: userProfile?.full_name || 'Freelancer',
        items: items || [],
      },
    })
  } catch (error) {
    console.error('Portal fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
