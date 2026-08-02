import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
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

    // Cascade delete items first
    await supabase
      .from('demand_template_items')
      .delete()
      .eq('template_id', templateId)

    // Delete template
    const { error } = await supabase
      .from('demand_templates')
      .delete()
      .eq('id', templateId)

    if (error) {
      console.error('Template deletion error:', error)
      return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
