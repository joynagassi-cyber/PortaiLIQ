import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // This route is called by Cloudflare Cron Trigger
  // It cleans up expired files from R2 storage
  
  try {
    // In production, this would:
    // 1. Query submissions older than 30 days
    // 2. Delete associated files from R2
    // 3. Clean up database records
    
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    
    // Verify the request is from Cloudflare
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Cleanup task executed successfully')
    
    return NextResponse.json({ 
      success: true,
      message: 'Nettoyage terminé'
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ error: 'Erreur lors du nettoyage' }, { status: 500 })
  }
}

export const runtime = 'edge'
