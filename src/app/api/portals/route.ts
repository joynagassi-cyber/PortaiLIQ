import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 })
    }

    // Generate unique token for the portal
    const token = crypto.randomBytes(16).toString('hex')

    // Create portal
    const { data: portal, error: portalError } = await supabase
      .from('portals')
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        token,
        status: 'draft',
      })
      .select()
      .single()

    if (portalError) {
      console.error('Error creating portal:', portalError)
      return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
    }

    return NextResponse.json({ portal }, { status: 201 })
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
      return NextResponse.json({ error: 'Erreur de requête' }, { status: 500 })
    }

    return NextResponse.json(portals)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, description, status } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (status) updateData.status = status

    const { data: portal, error } = await supabase
      .from('portals')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
    }

    return NextResponse.json({ portal })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const { error } = await supabase
      .from('portals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
