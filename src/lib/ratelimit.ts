import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

function createRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn('[RateLimit] UPSTASH env vars not set — rate limiting disabled.');
    return null;
  }

  try {
    return new Redis({ url, token });
  } catch (err) {
    console.warn('[RateLimit] Failed to create Redis client:', err);
    return null;
  }
}

const redis = createRedis();

function makeLimiter(requests: number, window: `${number} ${'s' | 'm' | 'h' | 'd'}`, prefix: string) {
  if (!redis) {
    // No-op limiter — always allows the request through
    return { limit: async (_id: string) => ({ success: true }) };
  }
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix,
  });
}

// 5 login attempts per IP per 60 seconds
export const loginRatelimit = makeLimiter(5, '60 s', 'ratelimit:login');

// 3 signup attempts per IP per 10 minutes
export const signupRatelimit = makeLimiter(3, '10 m', 'ratelimit:signup');

// 3 password reset requests per IP per 5 minutes
export const resetRatelimit = makeLimiter(3, '5 m', 'ratelimit:reset');
