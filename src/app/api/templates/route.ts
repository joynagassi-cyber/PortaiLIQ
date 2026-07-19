import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const templateSchema = z.object({
  name: z.string().min(1),
  professionCategory: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = templateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { name, professionCategory } = validationResult.data

    const { data: template, error } = await supabase
      .from('demand_templates')
      .insert({
        user_id: user.id,
        name,
        profession_category: professionCategory || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating template:', error)
      return NextResponse.json({ error: 'Erreur lors de la création du template' }, { status: 500 })
    }

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const profession = searchParams.get('profession')

    let query = supabase
      .from('demand_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (profession) {
      query = query.eq('profession_category', profession)
    }

    const { data: templates, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Erreur de requête' }, { status: 500 })
    }

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
