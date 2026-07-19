import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { id: portalId } = await params
    const body = await request.json()
    const { name, description, field_type, options, required, order } = body

    if (!name || !field_type) {
      return NextResponse.json({ error: 'Nom et type requis' }, { status: 400 })
    }

    // Check portal belongs to user
    const { data: portal } = await supabase
      .from('portals')
      .select('id')
      .eq('id', portalId)
      .eq('user_id', user.id)
      .single()

    if (!portal) {
      return NextResponse.json({ error: 'Portail non trouvé' }, { status: 404 })
    }

    const { data: item, error } = await supabase
      .from('items')
      .insert({
        portal_id: portalId,
        name,
        description: description || null,
        field_type,
        options: options || null,
        required: required || false,
        order: order || 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating item:', error)
      return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
    }

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: portalId } = await params

    const { data: items, error } = await supabase
      .from('items')
      .select('*')
      .eq('portal_id', portalId)
      .order('order', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Erreur de requête' }, { status: 500 })
    }

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { id: itemId } = await params
    const body = await request.json()

    const { data: item, error } = await supabase
      .from('items')
      .update(body)
      .eq('id', itemId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
    }

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { id: itemId } = await params

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId)

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
