import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * Complete upload and store metadata
 * POST /api/upload/complete
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { key, fileName, fileSize, fileType, portalItemId } = body

    if (!key || !fileName || !fileSize || !fileType || !portalItemId) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate file size
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large (max 10MB)' },
        { status: 400 }
      )
    }

    // Construct public R2 URL
    // In production: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET}/${key}`
    const fileUrl = `/uploads/${key}`

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName,
      fileSize,
      fileType,
    })
  } catch (error) {
    console.error('Upload complete error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
