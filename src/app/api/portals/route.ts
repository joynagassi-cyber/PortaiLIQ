import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'

const createPortalSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  clientProfileId: z.string().uuid().optional(),
})

const updatePortalSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  status: z.enum(['active', 'archived', 'completed']).optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = createPortalSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    // Generate unique token for the portal
    const token = crypto.randomBytes(16).toString('hex')

    const { data: portal, error } = await supabase
      .from('portals')
      .insert({
        userId: user.id,
        name: validationResult.data.name,
        description: validationResult.data.description || null,
        logoUrl: validationResult.data.logoUrl || null,
        clientProfileId: validationResult.data.clientProfileId || null,
        token,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      console.error('Portal creation error:', error)
      return NextResponse.json({ error: 'Failed to create portal' }, { status: 500 })
    }

    return NextResponse.json({ portal }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const portalId = searchParams.get('id')

    let query = supabase
      .from('portals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (portalId) {
      query = query.eq('id', portalId).single()
    }

    const { data: portals, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Query error' }, { status: 500 })
    }

    return NextResponse.json(portals)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = updatePortalSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid data' },
        { status: 400 }
      )
    }

    const { id, ...updateData } = validationResult.data

    const { data: portal, error } = await supabase
      .from('portals')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    return NextResponse.json({ portal })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing portal id' }, { status: 400 })
    }

    const { error } = await supabase
      .from('portals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
