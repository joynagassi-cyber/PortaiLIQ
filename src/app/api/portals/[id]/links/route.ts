import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { portalId, clientLabel } = body

    if (!portalId) {
      return NextResponse.json({ error: 'portalId is required' }, { status: 400 })
    }

    // Generate unique link token
    const token = crypto.randomBytes(16).toString('hex')

    // Verify portal belongs to user
    const { data: portal } = await supabase
      .from('portals')
      .select('id')
      .eq('id', portalId)
      .eq('user_id', user.id)
      .single()

    if (!portal) {
      return NextResponse.json({ error: 'Portal not found or access denied' }, { status: 404 })
    }

    const { data: link, error } = await supabase
      .from('portal_access_links')
      .insert({
        portalId: portalId,
        token,
        clientLabel: clientLabel || null,
        reminderSchedule: '["3d","7d"]',
        remindersEnabled: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Link creation error:', error)
      return NextResponse.json({ error: 'Failed to create link' }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    return NextResponse.json({
      link: {
        ...link,
        url: `${baseUrl}/portal/${token}`,
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
