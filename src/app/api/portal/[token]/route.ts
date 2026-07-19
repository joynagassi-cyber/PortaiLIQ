import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const supabase = await createClient()
    const { token } = await params

    // Fetch portal by token
    const { data: portal, error: portalError } = await supabase
      .from('portals')
      .select(`
        *,
        items (
          id,
          name,
          description,
          field_type,
          options,
          required,
          order
        )
      `)
      .eq('token', token)
      .eq('status', 'published')
      .single()

    if (portalError || !portal) {
      return NextResponse.json(
        { error: 'Portail non trouvé ou non publié' },
        { status: 404 }
      )
    }

    return NextResponse.json({ portal })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
