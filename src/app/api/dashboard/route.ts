import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch portals with item and submission counts
    const { data: portals, error: portalsError } = await supabase
      .from('portals')
      .select(`
        id, name, status, created_at,
        items:portal_items(count),
        submissions:portal_items(submissions(status))
      `, {
        count: 'exact',
      })
      .eq('user_id', user.id)

    if (portalsError) {
      console.error('Dashboard fetch error:', portalsError)
      return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
    }

    const safePortals = portals || []

    const totalPortals = safePortals.length
    const activePortals = safePortals.filter((p: any) => p.status === 'active').length
    const totalItems = safePortals.reduce(
      (acc: number, p: any) => acc + (p.items?.[0]?.count || 0), 0
    )
    const totalSubmissions = safePortals.reduce((acc: number, p: any) => {
      const subs = p.submissions?.flatMap((item: any) => item.submissions || []) || []
      return acc + subs.filter((s: any) => s.status === 'received').length
    }, 0)

    return NextResponse.json({
      totalPortals,
      activePortals,
      totalItems,
      totalSubmissions,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
