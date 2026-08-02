import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Apply template to create new portal with items
 * POST /api/templates/:id/apply
 */
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
    const { portalName, portalDescription, clientProfileId } = body

    if (!portalName) {
      return NextResponse.json({ error: 'Portal name is required' }, { status: 400 })
    }

    // Verify template belongs to user
    const { data: template, error: templateError } = await supabase
      .from('demand_templates')
      .select(`
        *,
        items:demand_template_items(*)
      `)
      .eq('id', templateId)
      .eq('user_id', user.id)
      .single()

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Create portal
    const crypto = await import('crypto')
    const token = crypto.randomBytes(16).toString('hex')

    const { data: portal, error: portalError } = await supabase
      .from('portals')
      .insert({
        userId: user.id,
        name: portalName,
        description: portalDescription || null,
        clientProfileId: clientProfileId || null,
        token,
        status: 'active',
      })
      .select()
      .single()

    if (portalError) {
      console.error('Portal creation error:', portalError)
      return NextResponse.json({ error: 'Failed to create portal' }, { status: 500 })
    }

    // Copy template items to portal items
    if (template.items && template.items.length > 0) {
      const portalItemsToInsert = template.items.map((item: any) => ({
        portalId: portal.id,
        templateItemId: item.id,
        label: item.label,
        description: item.description || null,
        itemType: item.itemType,
        expectedFormat: item.expectedFormat || null,
        required: item.required,
        choices: item.choices || null,
        sortOrder: item.sortOrder,
      }))

      await supabase.from('portal_items').insert(portalItemsToInsert)
    }

    return NextResponse.json({
      portal,
      itemCount: template.items?.length || 0,
    }, { status: 201 })
  } catch (error) {
    console.error('Template apply error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
