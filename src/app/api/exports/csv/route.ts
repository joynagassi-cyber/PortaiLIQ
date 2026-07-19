import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { submissions } from '@/db/schema'

// Generate CSV from submissions data
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
    const { data: submissionsData, error: submissionsError } = await supabase
      .from('submissions')
      .select(`
        *,
        portal_items!inner (
          id,
          title,
          field_type,
          required
        )
      `)
      .eq('portal_id', portalId)
      .order('created_at', { ascending: true })

    if (submissionsError) {
      console.error('Submissions fetch error:', submissionsError)
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      )
    }

    if (!submissionsData || submissionsData.length === 0) {
      return NextResponse.json(
        { error: 'No submissions found for this portal' },
        { status: 404 }
      )
    }

    // Build CSV
    const headers = [
      'Soumission ID',
      'Client',
      'Email',
      'Date',
      'Statut',
      ...submissionsData[0].portal_items.map((item: any) => item.title)
    ]

    const rows = submissionsData.map((sub: any) => {
      const row = [
        sub.id,
        sub.client_name || '',
        sub.client_email || '',
        new Date(sub.created_at).toISOString(),
        sub.status,
        ...(sub.answers || []).map((answer: any) => {
          // Find the corresponding item title
          const answerKey = Object.keys(answer)[0]
          let cellValue = String(answer[answerKey] || '')
          
          // CSV injection protection: escape cells starting with formula characters
          if (cellValue.match(/^[=\+\-@\t]/)) {
            cellValue = "'" + cellValue
          }
          
          return cellValue
        })
      ]
      return row
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n')

    const fileName = `portail-${portalId.substring(0, 8)}-exports-${new Date().toISOString().split('T')[0]}.csv`

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error('CSV Export error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
