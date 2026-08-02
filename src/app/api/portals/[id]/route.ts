import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    let query = supabase
      .from('portals')
      .select(`
        *,
        items:portal_items(*),
        submissions:portal_items(submissions(status))
      `)
      .eq('user_id', user.id)

    if (id) {
      query = query.eq('id', id).single()
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data: portals, error } = await query

    if (error) {
      console.error('Fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch portals' }, { status: 500 })
    }

    return NextResponse.json(portals)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
