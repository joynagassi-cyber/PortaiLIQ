import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updateItemSchema = z.object({
  label: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  itemType: z.enum(['text', 'file', 'email', 'phone', 'number', 'url', 'date', 'multiple_choice']).optional(),
  expectedFormat: z.string().max(50).optional(),
  required: z.boolean().optional(),
  choices: z.array(z.string()).optional(),
  sortOrder: z.number().int().min(0).optional(),
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: portalId, itemId } = await params
    const body = await request.json()
    const validationResult = updateItemSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid data' },
        { status: 400 }
      )
    }

    // Verify portal belongs to user
    const { data: portal } = await supabase
      .from('portals')
      .select('id')
      .eq('id', portalId)
      .eq('user_id', user.id)
      .single()

    if (!portal) {
      return NextResponse.json({ error: 'Portal not found' }, { status: 404 })
    }

    // Verify item belongs to portal
    const { data: item } = await supabase
      .from('portal_items')
      .select('id')
      .eq('id', itemId)
      .eq('portal_id', portalId)
      .single()

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const { data: updatedItem, error } = await supabase
      .from('portal_items')
      .update(validationResult.data)
      .eq('id', itemId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    return NextResponse.json({ item: updatedItem })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: portalId, itemId } = await params

    // Verify portal belongs to user
    const { data: portal } = await supabase
      .from('portals')
      .select('id')
      .eq('id', portalId)
      .eq('user_id', user.id)
      .single()

    if (!portal) {
      return NextResponse.json({ error: 'Portal not found' }, { status: 404 })
    }

    // Verify item belongs to portal
    const { data: item } = await supabase
      .from('portal_items')
      .select('id')
      .eq('id', itemId)
      .eq('portal_id', portalId)
      .single()

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('portal_items')
      .delete()
      .eq('id', itemId)

    if (error) {
      return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
