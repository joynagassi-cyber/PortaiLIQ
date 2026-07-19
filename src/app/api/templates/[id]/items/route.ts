import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const templateItemSchema = z.object({
  label: z.string().min(1),
  description: z.string().optional(),
  itemType: z.enum(['text', 'file', 'multiple_choice', 'date', 'number']),
  expectedFormat: z.string().optional(),
  required: z.boolean().default(true),
  sortOrder: z.number().default(0),
  choices: z.array(z.string()).optional(),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: templateId } = await params
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Verify template belongs to user
    const { data: template } = await supabase
      .from('demand_templates')
      .select('id')
      .eq('id', templateId)
      .eq('user_id', user.id)
      .single()

    if (!template) {
      return NextResponse.json({ error: 'Template non trouvé' }, { status: 404 })
    }

    const body = await request.json()
    const validationResult = templateItemSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { label, description, itemType, expectedFormat, required, sortOrder, choices } = validationResult.data

    const { data: newItem, error } = await supabase
      .from('demand_template_items')
      .insert({
        template_id: templateId,
        label,
        description: description || null,
        item_type: itemType,
        expected_format: expectedFormat || null,
        required,
        sort_order: sortOrder,
        choices: choices || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating template item:', error)
      return NextResponse.json({ error: 'Erreur lors de la création de l\'item' }, { status: 500 })
    }

    return NextResponse.json({ item: newItem }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
