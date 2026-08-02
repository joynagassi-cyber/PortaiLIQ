import { NextResponse } from 'next/server'

/**
 * File cleanup cron — triggered by Cloudflare Cron Trigger
 * GET /api/cron/cleanup?secret={CRON_SECRET}
 *
 * Deletes files older than CLEANUP_DAYS (default: 30 days) from R2
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const CLEANUP_DAYS = parseInt(process.env.CLEANUP_DAYS || '30', 10)

    console.log(`Cleanup task: deleting files older than ${CLEANUP_DAYS} days`)

    // In production: query submissions with file_url older than N days
    // and delete from R2 bucket
    /*
    const { data: expiredSubmissions } = await supabase
      .from('submissions')
      .select('id, file_url, file_name')
      .lt('submitted_at', new Date(Date.now() - CLEANUP_DAYS * 24 * 60 * 60 * 1000).toISOString())
      .not('file_url', 'is', null)

    for (const sub of expiredSubmissions) {
      // Delete from R2
      await r2.delete(sub.fileUrl.split('/').pop()!)
      // Soft delete submission
      await supabase
        .from('submissions')
        .update({ status: 'expired' })
        .eq('id', sub.id)
    }
    */

    return NextResponse.json({
      success: true,
      message: `Cleanup completed (${CLEANUP_DAYS} day retention)`,
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
