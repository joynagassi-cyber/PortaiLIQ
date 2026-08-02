import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const portalId = searchParams.get('portalId')

    if (!portalId) {
      return NextResponse.json(
        { error: 'portalId is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify user owns this portal
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: portal } = await supabase
      .from('portals')
      .select('id')
      .eq('id', portalId)
      .eq('user_id', user.id)
      .single()

    if (!portal) {
      return NextResponse.json(
        { error: 'Portal not found or access denied' },
        { status: 404 }
      )
    }

    // Fetch submissions with portal items
    const { data: submissionsData, error: subError } = await supabase
      .from('submissions')
      .select(`
        id, content_text, file_url, file_name, file_type, status, submitted_at,
        portal_item:portal_items(id, label, item_type)
      `)
      .eq('portal_item_id', portalId)

    // Alternative: fetch all submissions for portal items of this portal
    const { data: portalItems } = await supabase
      .from('portal_items')
      .select('id, label')
      .eq('portal_id', portalId)

    const { data: allSubmissions, error: allSubError } = await supabase
      .from('submissions')
      .select(`
        id, content_text, file_url, file_name, file_type, status, submitted_at,
        portal_item_id, portal_item:portal_items(label, item_type)
      `)
      .in('portal_item_id', portalItems?.map((i: any) => i.id) || [])
      .order('submitted_at', { ascending: true })

    if (allSubError || !allSubmissions) {
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      )
    }

    if (allSubmissions.length === 0) {
      return NextResponse.json(
        { error: 'No submissions found for this portal' },
        { status: 404 }
      )
    }

    // Build CSV headers
    const headers = [
      'Submission ID',
      'Field',
      'Type',
      'Content',
      'File URL',
      'File Name',
      'Status',
      'Submitted At',
    ]

    // CSV injection protection
    function protectCell(value: string): string {
      if (/^[\=\+\-\@]/.test(value)) {
        return "'" + value
      }
      return value
    }

    function escapeCsv(value: string): string {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return '"' + value.replace(/"/g, '""') + '"'
      }
      return value
    }

    const rows = allSubmissions.map((sub: any) => [
      sub.id,
      sub.portal_item?.label || '',
      sub.portal_item?.item_type || '',
      protectCell(escapeCsv(sub.content_text || '')),
      escapeCsv(sub.file_url || ''),
      escapeCsv(sub.file_name || ''),
      sub.status || 'pending',
      new Date(sub.submitted_at).toISOString(),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n')

    const fileName = `portal-${portalId.substring(0, 8)}-${new Date().toISOString().split('T')[0]}.csv`

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error('CSV export error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
