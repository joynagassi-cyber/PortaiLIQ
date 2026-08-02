import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Generate presigned URL for R2 upload
 * POST /api/upload/presign
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { fileName, fileType, portalItemId, expectedFormat } = body

    if (!fileName || !fileType || !portalItemId) {
      return NextResponse.json(
        { error: 'fileName, fileType, and portalItemId are required' },
        { status: 400 }
      )
    }

    // Validate file type
    const ALLOWED_TYPES = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'text/plain', 'text/csv',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]

    if (!ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      )
    }

    // Sanitize filename
    const safeFilename = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    const key = `uploads/${user.id}/${Date.now()}-${safeFilename}`

    // Generate warning if expected format doesn't match
    let warning: string | null = null
    if (expectedFormat) {
      const expectedFormats = expectedFormat.split(',').map(f => f.trim().toUpperCase())
      const actualExt = fileType.split('/')[1]?.toUpperCase()
      const matches = expectedFormats.some(fmt =>
        actualExt.includes(fmt.split('.')[1] || fmt)
      )
      if (!matches) {
        warning = `Expected format: ${expectedFormat}. Uploaded: ${fileType}. This may not meet requirements.`
      }
    }

    // In production: generate presigned URL via Cloudflare R2 SDK
    /*
    import { S3Client, PutObjectCommand } from "@cloudflare/workers-types"
    const r2 = new S3Client({
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
      region: 'auto',
    })
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: fileType,
    })
    const presignedUrl = await getSignedUrl(r2, command, { expiresIn: 300 })
    */

    return NextResponse.json({
      uploadUrl: `/api/upload/complete`, // placeholder — use R2 presign in production
      key,
      warning,
    })
  } catch (error) {
    console.error('Upload presign error:', error)
    return NextResponse.json(
      { error: 'Upload service unavailable' },
      { status: 500 }
    )
  }
}
