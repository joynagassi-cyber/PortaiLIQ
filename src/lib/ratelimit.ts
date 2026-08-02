// Lightweight in-memory rate limiter for Next.js middleware
// For Cloudflare deployment, this will be replaced with Cloudflare KV

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

interface RateLimitConfig {
  max: number
  window: number // seconds
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  '/api/submissions': { max: 50, window: 3600 },
  '/api/upload': { max: 100, window: 3600 },
  '/api/portal/[token]': { max: 200, window: 3600 },
  '/api/ai': { max: 30, window: 3600 },
}

function getDefaultRateLimit(): RateLimitConfig {
  return { max: 1000, window: 3600 }
}

function getMatchingConfig(pathname: string): RateLimitConfig {
  for (const [pattern, limit] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(pattern)) {
      return limit
    }
  }
  return getDefaultRateLimit()
}

function getRateLimitKey(ip: string, pathname: string): string {
  return `rate:${ip}:${pathname}`
}

function getRateLimitEntry(key: string): { count: number; resetAt: number } | null {
  const entry = rateLimitStore.get(key)
  if (!entry) return null

  // Clean up old entries (run periodically)
  if (Date.now() > entry.resetAt) {
    rateLimitStore.delete(key)
    return null
  }

  return entry
}

function incrementRateLimit(key: string, config: RateLimitConfig): { count: number; exceeded: boolean } {
  const entry = getRateLimitEntry(key)

  if (!entry) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: Date.now() + config.window * 1000,
    })
    return { count: 1, exceeded: false }
  }

  entry.count++

  return {
    count: entry.count,
    exceeded: entry.count > config.max,
  }
}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export { getRateLimitKey, incrementRateLimit, getMatchingConfig }
export type { RateLimitConfig }
