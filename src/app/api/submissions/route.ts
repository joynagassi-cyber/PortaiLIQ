import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { submissions, portalItems } from '@/db/schema'
import { CacheService } from '@/lib/cache'
import { ratelimit } from '@/lib/ratelimit' // Assuming this exists

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const portalToken = searchParams.get('portalToken')
    
    if (!portalToken) {
      return NextResponse.json(
        { error: 'Portal token is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { answers, clientName, clientEmail } = body

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json(
        { error: 'At least one answer is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Get portal by token
    const { data: portal, error: portalError } = await supabase
      .from('portals')
      .select('id, user_id')
      .eq('share_token', portalToken)
      .single()

    if (portalError || !portal) {
      return NextResponse.json(
        { error: 'Portal not found' },
        { status: 404 }
      )
    }

    // Get portal items for validation
    const { data: items, error: itemsError } = await supabase
      .from('portal_items')
      .select('*')
      .eq('portal_id', portal.id)

    if (itemsError) {
      return NextResponse.json(
        { error: 'Failed to fetch portal items' },
        { status: 500 }
      )
    }

    // Validate required fields
    const requiredFields = items.filter((item: any) => item.required)
    const missingRequired = requiredFields.filter((item: any) => !answers[item.id])
    
    if (missingRequired.length > 0) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          missing: missingRequired.map((item: any) => item.title)
        },
        { status: 400 }
      )
    }

    // Create submission
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        portal_id: portal.id,
        answers: answers,
        client_name: clientName,
        client_email: clientEmail,
        status: 'submitted'
      })
      .select()
      .single()

    if (submissionError) {
      console.error('Submission error:', submissionError)
      return NextResponse.json(
        { error: 'Failed to create submission' },
        { status: 500 }
      )
    }

    // Invalidate cache for this portal
    await CacheService.invalidateSubmissions(portal.id)

    // Send notification email
    try {
      const brevo = await import('@/lib/brevo')
      await brevo.sendSubmissionNotification(portal.user_id, submission.id)
    } catch (emailError) {
      console.error('Email notification failed:', emailError)
      // Don't fail the submission if email fails
    }

    return NextResponse.json({ 
      success: true, 
      submissionId: submission.id 
    })
  } catch (error) {
    console.error('Submission creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Try cache first
    const cached = await CacheService.getSubmissions(portalId)
    if (cached) {
      return NextResponse.json(cached)
    }

    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('portal_id', portalId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      )
    }

    // Cache the result
    await CacheService.setSubmissions(portalId, data)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Submissions fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
