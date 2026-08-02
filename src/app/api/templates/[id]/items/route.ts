import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const templateItemSchema = z.object({
  label: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  itemType: z.enum(['text', 'file', 'email', 'phone', 'number', 'url', 'date', 'multiple_choice']),
  expectedFormat: z.string().max(50).optional(),
  required: z.boolean().default(true),
  choices: z.array(z.string()).optional(),
  sortOrder: z.number().int().min(0).default(0),
})

// GET /api/templates/:id/items
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: templateId } = await params

    // Verify template belongs to user
    const { data: template } = await supabase
      .from('demand_templates')
      .select('id')
      .eq('id', templateId)
      .eq('user_id', user.id)
      .single()

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const { data: items, error } = await supabase
      .from('demand_template_items')
      .select('*')
      .eq('template_id', templateId)
      .order('sort_order', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
    }

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/templates/:id/items
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: templateId } = await params
    const body = await request.json()
    const validationResult = templateItemSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    // Verify template belongs to user
    const { data: template } = await supabase
      .from('demand_templates')
      .select('id')
      .eq('id', templateId)
      .eq('user_id', user.id)
      .single()

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const { data: newItem, error } = await supabase
      .from('demand_template_items')
      .insert({
        templateId: templateId,
        label: validationResult.data.label,
        description: validationResult.data.description || null,
        itemType: validationResult.data.itemType,
        expectedFormat: validationResult.data.expectedFormat || null,
        required: validationResult.data.required,
        choices: validationResult.data.choices || null,
        sortOrder: validationResult.data.sortOrder,
      })
      .select()
      .single()

    if (error) {
      console.error('Template item creation error:', error)
      return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
    }

    return NextResponse.json({ item: newItem }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
