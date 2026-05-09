import { Redis } from '@upstash/redis'

let redis: Redis | null = null

// Initialize Redis client if env vars are available
function getRedisClient(): Redis | null {
  if (redis) return redis

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    return null
  }

  redis = new Redis({ url, token })
  return redis
}

export async function getCached(key: string): Promise<string | null> {
  const client = getRedisClient()
  if (!client) return null

  try {
    const value = await client.get(key)
    return value as string | null
  } catch (error) {
    console.error('Redis get error:', error)
    return null
  }
}

export async function setCached(
  key: string,
  value: string,
  ttlSeconds: number
): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  try {
    await client.setex(key, ttlSeconds, value)
  } catch (error) {
    console.error('Redis set error:', error)
  }
}
