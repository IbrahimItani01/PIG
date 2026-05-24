import { Redis } from "@upstash/redis";
import type { Plan } from "@prisma/client";
import { rateLimitConfig } from "@/config/rate-limits";
import { getOptionalEnv } from "@/lib/utils/env";

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

const memoryStore = new Map<string, { count: number; reset: number }>();
let redis: Redis | null = null;

function getRedis() {
  const url = getOptionalEnv("UPSTASH_REDIS_REST_URL");
  const token = getOptionalEnv("UPSTASH_REDIS_REST_TOKEN");
  if (!url || !token) return null;
  redis ??= new Redis({ url, token });
  return redis;
}

export function getEvaluationLimit(plan?: Plan) {
  if (!plan) return rateLimitConfig.anonymous.dailyEvaluations;
  return rateLimitConfig.byPlan[plan].dailyEvaluations;
}

export async function checkEvaluationRateLimit(identifier: string, plan?: Plan): Promise<RateLimitResult> {
  const limit = getEvaluationLimit(plan);
  const windowSeconds = plan ? rateLimitConfig.byPlan[plan].windowSeconds : rateLimitConfig.anonymous.windowSeconds;
  const now = Date.now();
  const reset = now + windowSeconds * 1000;
  const key = `rate:evaluations:${identifier}:${new Date().toISOString().slice(0, 10)}`;
  const client = getRedis();

  if (!client) {
    const current = memoryStore.get(key);
    if (!current || current.reset < now) {
      memoryStore.set(key, { count: 1, reset });
      return { success: true, limit, remaining: limit - 1, reset };
    }
    const next = current.count + 1;
    memoryStore.set(key, { ...current, count: next });
    return { success: next <= limit, limit, remaining: Math.max(0, limit - next), reset: current.reset };
  }

  const count = await client.incr(key);
  if (count === 1) {
    await client.expire(key, windowSeconds);
  }
  const ttl = await client.ttl(key);
  const redisReset = Date.now() + Math.max(ttl, 0) * 1000;
  const success = count <= limit;
  if (!success) console.warn("Rate limit exceeded", { identifier, plan, limit });
  return { success, limit, remaining: Math.max(0, limit - count), reset: redisReset };
}
