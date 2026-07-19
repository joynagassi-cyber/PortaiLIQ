import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { kv } from '@vercel/kv'

// Rate limiting configuration
const RATE_LIMITS: Record<string, { max: number; window: number }> = {
  '/api/submissions': { max: 50, window: 3600 }, // 50 submissions per hour
  '/api/upload': { max: 100, window: 3600 }, // 100 uploads per hour
  '/api/portal/[token]': { max: 200, window: 3600 }, // 200 requests per hour
  '/api/ai': { max: 30, window: 3600 }, // 30 AI calls per hour
  'default': { max: 1000, window: 3600 }, // 1000 requests per hour
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip rate limiting for health checks and static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/api/health')) {
    return NextResponse.next()
  }

  // Get client IP
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  const rateKey = `rate:${ip}:${pathname}`
  
  // Find matching rate limit config
  let config = RATE_LIMITS['default']
  for (const [pattern, limit] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(pattern)) {
      config = limit
      break
    }
  }

  // Check rate limit
  const count = await kv.incr(rateKey)
  if (count === 1) {
    await kv.expire(rateKey, config.window)
  }

  const response = NextResponse.next()
  
  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', config.max.toString())
  response.headers.set('X-RateLimit-Remaining', Math.max(0, config.max - count).toString())
  response.headers.set('X-RateLimit-Reset', String(Date.now() / 1000 + config.window))

  // Return 429 if limit exceeded
  if (count > config.max) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  return response
}

export const config = {
  matcher: ['/api/:path*'],
}
