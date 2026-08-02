import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const body = await request.json()
    const { portalToken, answers, linkToken, clientName, clientEmail } = body

    if (!portalToken) {
      return NextResponse.json(
        { error: 'Portal token is required' },
        { status: 400 }
      )
    }

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json(
        { error: 'At least one answer is required' },
        { status: 400 }
      )
    }

    // Get portal by token
    const { data: portal, error: portalError } = await supabase
      .from('portals')
      .select('id, user_id, status')
      .eq('token', portalToken)
      .single()

    if (portalError || !portal) {
      return NextResponse.json(
        { error: 'Portal not found' },
        { status: 404 }
      )
    }

    // Verify portal is active
    if (portal.status !== 'active') {
      return NextResponse.json(
        { error: 'Portal is not accepting submissions' },
        { status: 403 }
      )
    }

    // Get portal items for validation
    const { data: items, error: itemsError } = await supabase
      .from('portal_items')
      .select('id, label, item_type, required')
      .eq('portal_id', portal.id)

    if (itemsError) {
      return NextResponse.json(
        { error: 'Failed to fetch portal items' },
        { status: 500 }
      )
    }

    // Validate required fields
    const missingRequired = items.filter((item: any) => {
      if (!item.required) return false
      const answer = answers[item.id]
      if (!answer) return true
      if (typeof answer === 'string' && answer.trim() === '') return true
      if (typeof answer === 'object' && answer !== null && !answer.file_url && !answer.contentText) return true
      return false
    })

    if (missingRequired.length > 0) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          missing: missingRequired.map((item: any) => item.label),
        },
        { status: 400 }
      )
    }

    // Create submissions — one per portal item
    const submissionsToInsert = items.map((item: any) => {
      const answer = answers[item.id]
      const isFile = item.item_type === 'file'
      const isObjectAnswer = typeof answer === 'object' && answer !== null

      return {
        portalItemId: item.id,
        portalAccessLinkId: linkToken || null,
        contentText: isFile ? null : (isObjectAnswer ? answer.contentText || '' : String(answer)),
        fileUrl: isObjectAnswer ? answer.file_url || null : null,
        fileName: isObjectAnswer ? answer.file_name || null : null,
        fileSize: isObjectAnswer ? answer.file_size || null : null,
        fileType: isObjectAnswer ? answer.file_type || null : null,
        status: 'received',
      }
    })

    const { data: submissions, error: subError } = await supabase
      .from('submissions')
      .insert(submissionsToInsert)
      .select()

    if (subError) {
      console.error('Submission error:', subError)
      return NextResponse.json(
        { error: 'Failed to create submission' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      submissionIds: submissions?.map((s: any) => s.id) || [],
    })
  } catch (error) {
    console.error('Submission creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
