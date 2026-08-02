import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getRateLimitKey, incrementRateLimit, getMatchingConfig } from '@/lib/ratelimit'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip rate limiting for health checks and static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/api/health')) {
    return NextResponse.next()
  }

  // Get client IP
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',').pop()?.trim()
    ?? request.headers.get('x-real-ip')
    ?? request.ip
    ?? 'unknown'

  const config = getMatchingConfig(pathname)
  const rateKey = getRateLimitKey(ip, pathname)
  const { count, exceeded } = incrementRateLimit(rateKey, config)

  const response = NextResponse.next()

  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', config.max.toString())
  response.headers.set('X-RateLimit-Remaining', Math.max(0, config.max - count).toString())
  response.headers.set('X-RateLimit-Reset', String(Math.ceil((config.window * 1000 + Date.now()) / 1000)))

  if (exceeded) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  return response
}

export const config = {
  matcher: ['/api/:path*'],
}
