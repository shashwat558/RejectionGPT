/**
 * Rate limiting.
 * Uses Upstash Redis if REDIS_URL is set, otherwise falls back to in-memory
 * (single-instance dev only). All helpers return { allowed, remaining }.
 */

type Entry = { count: number; expiresAt: number };
const mem = new Map<string, Entry>();

let upstash: { incr: (key: string) => Promise<number>; expire: (key: string, s: number) => Promise<unknown> } | null = null;

async function getUpstash() {
  if (upstash) return upstash;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  // Lazy import ioredis only when configured to avoid build-time connection.
  const { default: Redis } = await import("ioredis");
  const client = new Redis(url, { maxRetriesPerRequest: 1, lazyConnect: true });
  upstash = {
    incr: async (key: string) => client.incr(key),
    expire: async (key: string, s: number) => client.expire(key, s),
  };
  return upstash;
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<{ allowed: boolean; remaining: number }> {
  const store = await getUpstash().catch(() => null);
  if (store) {
    try {
      const current = await store.incr(key);
      if (current === 1) await store.expire(key, windowSec);
      return { allowed: current <= limit, remaining: Math.max(0, limit - current) };
    } catch {
      // fall through to memory on redis failure
    }
  }
  const now = Date.now();
  const e = mem.get(key);
  if (!e || e.expiresAt < now) {
    mem.set(key, { count: 1, expiresAt: now + windowSec * 1000 });
    return { allowed: true, remaining: limit - 1 };
  }
  e.count += 1;
  return { allowed: e.count <= limit, remaining: Math.max(0, limit - e.count) };
}

export function rateLimitHeaders(remaining: number, limit: number) {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(remaining),
  };
}
