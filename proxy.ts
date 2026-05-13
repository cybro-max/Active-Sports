import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Only create ratelimiter if we have Upstash env vars with valid URLs
const redis =
  process.env.UPSTASH_REDIS_REST_URL?.startsWith('http') && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Allow 100 requests per day per IP to match API quota
const ratelimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 d'),
  analytics: true,
}) : null;

export async function proxy(request: NextRequest) {
  // Only apply rate limiting to API routes, skip the auth endpoints
  if (!ratelimit || !request.nextUrl.pathname.startsWith('/api/') || request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', reset.toString());
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
