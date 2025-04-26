import type { APIContext, APIRoute } from "astro";
import { RateLimiterMemory } from "rate-limiter-flexible";

// Configure rate limits
const RATE_LIMIT_POINTS = 100; // Number of requests allowed
const RATE_LIMIT_DURATION = 300; // Duration in seconds (5 minutes)

// Default user ID for development
const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000000";

// Create in-memory rate limiter
const rateLimiter = new RateLimiterMemory({
  points: RATE_LIMIT_POINTS,
  duration: RATE_LIMIT_DURATION,
});

export async function checkRateLimit(userId: string): Promise<void> {
  try {
    await rateLimiter.consume(userId);
  } catch (error) {
    const retryAfter = Math.ceil((error as any).msBeforeNext / 1000) || RATE_LIMIT_DURATION;
    throw new Error(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
  }
}

export function withRateLimit(handler: APIRoute): APIRoute {
  return async (context: APIContext) => {
    try {
      await checkRateLimit(DEFAULT_USER_ID);
      return await handler(context);
    } catch (error) {
      if (error instanceof Error && error.message.includes("Rate limit exceeded")) {
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": String(RATE_LIMIT_DURATION),
            },
          }
        );
      }
      throw error;
    }
  };
} 