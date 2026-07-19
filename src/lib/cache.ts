import { kv } from '@vercel/kv'

// Cache utility for Vercel KV / Redis
export class CacheService {
  private static TTL_PORTAL = 300 // 5 minutes
  private static TTL_SUBMISSION = 600 // 10 minutes
  private static TTL_AI = 3600 // 1 hour

  // Portal cache
  static async getPortal(token: string) {
    const cached = await kv.get(`portal:${token}`)
    if (cached) return cached
    return null
  }

  static async setPortal(token: string, data: any) {
    await kv.setex(`portal:${token}`, this.TTL_PORTAL, JSON.stringify(data))
  }

  static async invalidatePortal(token: string) {
    await kv.del(`portal:${token}`)
  }

  // Submission cache
  static async getSubmissions(portalId: string) {
    const cached = await kv.get(`submissions:${portalId}`)
    if (cached) return cached
    return null
  }

  static async setSubmissions(portalId: string, data: any) {
    await kv.setex(`submissions:${portalId}`, this.TTL_SUBMISSION, JSON.stringify(data))
  }

  static async invalidateSubmissions(portalId: string) {
    await kv.del(`submissions:${portalId}`)
  }

  // AI results cache
  static async getAiResult(submissionId: string) {
    const cached = await kv.get(`ai:result:${submissionId}`)
    if (cached) return cached
    return null
  }

  static async setAiResult(submissionId: string, data: any) {
    await kv.setex(`ai:result:${submissionId}`, this.TTL_AI, JSON.stringify(data))
  }

  // Dashboard stats cache
  static async getDashboardStats(userId: string) {
    const cached = await kv.get(`dashboard:${userId}`)
    if (cached) return cached
    return null
  }

  static async setDashboardStats(userId: string, data: any) {
    await kv.setex(`dashboard:${userId}`, 300, JSON.stringify(data)) // 5 min
  }

  static async invalidateDashboard(userId: string) {
    await kv.del(`dashboard:${userId}`)
  }

  // Rate limiting
  static async incrementRateLimit(key: string, limit: number = 100, window: number = 3600) {
    const count = await kv.incr(`rate:${key}`)
    if (count === 1) {
      await kv.expire(`rate:${key}`, window)
    }
    return count > limit
  }

  static async checkRateLimit(key: string, limit: number = 100, window: number = 3600) {
    const count = await kv.get(`rate:${key}`)
    return (count as number || 0) >= limit
  }
}
