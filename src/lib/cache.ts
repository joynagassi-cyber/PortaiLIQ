// Cache service — uses Cloudflare KV in production, in-memory Map in dev
// For Cloudflare Workers deployment

// In-memory fallback for development
const memoryCache = new Map<string, { data: any; expiresAt: number }>()

interface CacheOptions {
  ttl?: number // seconds
}

class InMemoryCache {
  private get(key: string): any | null {
    const entry = memoryCache.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      memoryCache.delete(key)
      return null
    }
    return entry.data
  }

  private set(key: string, data: any, ttl: number): void {
    memoryCache.set(key, {
      data,
      expiresAt: Date.now() + ttl * 1000,
    })
  }

  private delete(key: string): void {
    memoryCache.delete(key)
  }

  private has(key: string): boolean {
    return this.get(key) !== null
  }
}

const cache = new InMemoryCache()

// Portal cache (5 min TTL)
export async function getPortalCache(token: string) {
  return cache.get(`portal:${token}`)
}

export async function setPortalCache(token: string, data: any) {
  cache.set(`portal:${token}`, data, 300)
}

export async function invalidatePortalCache(token: string) {
  cache.delete(`portal:${token}`)
}

// Submission cache (10 min TTL)
export async function getSubmissionsCache(portalId: string) {
  return cache.get(`submissions:${portalId}`)
}

export async function setSubmissionsCache(portalId: string, data: any) {
  cache.set(`submissions:${portalId}`, data, 600)
}

export async function invalidateSubmissionsCache(portalId: string) {
  cache.delete(`submissions:${portalId}`)
}

// AI results cache (1 hour TTL)
export async function getAiResultCache(submissionId: string) {
  return cache.get(`ai:result:${submissionId}`)
}

export async function setAiResultCache(submissionId: string, data: any) {
  cache.set(`ai:result:${submissionId}`, data, 3600)
}

// Dashboard stats cache (5 min TTL)
export async function getDashboardStatsCache(userId: string) {
  return cache.get(`dashboard:${userId}`)
}

export async function setDashboardStatsCache(userId: string, data: any) {
  cache.set(`dashboard:${userId}`, data, 300)
}

export async function invalidateDashboardCache(userId: string) {
  cache.delete(`dashboard:${userId}`)
}
