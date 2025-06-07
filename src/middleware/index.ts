import type { MiddlewareHandler } from "astro";
import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/generate",
  "/auth/login",
  "/auth/register",
  "/auth/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
  "/api/generations",
  "/api/debug/auth",
];

// Helper function to check if path is public
const isPublicPath = (pathname: string): boolean => {
  // Check exact matches
  if (PUBLIC_PATHS.includes(pathname)) return true;

  // Check if it's login with parameters
  if (pathname.startsWith("/auth/login")) return true;

  // Check if it's debug paths
  if (pathname.startsWith("/debug/")) return true;

  return false;
};

// Add CORS headers to response
const addCorsHeaders = (response: Response): Response => {
  const newHeaders = new Headers(response.headers);
  newHeaders.set("Access-Control-Allow-Origin", "*");
  newHeaders.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  newHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
};

export const onRequest: MiddlewareHandler = defineMiddleware(
  async (context, next) => {
    const { cookies, request, locals } = context;
    const pathname = context.url.pathname;

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // Create Supabase client directly according to guidelines
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Store Supabase client in locals for reuse
    locals.supabase = supabase;

    // Skip auth check for public paths
    if (isPublicPath(pathname)) {
      // Even for public paths, check if user is logged in
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          locals.user = user;
        }
      } catch (error) {
        // Log auth errors for debugging, but don't block public paths
        if (error instanceof Error && error.message.includes("1003")) {
          console.warn(
            "Cloudflare Workers network error (1003) in public path:",
            error.message,
          );
        }
      }

      const response = await next();
      return pathname.startsWith("/api/") ? addCorsHeaders(response) : response;
    }

    // IMPORTANT: Always get user session first before any other operations
    let user = null;
    try {
      const result = await supabase.auth.getUser();

      // Check for error in response (not thrown exception)
      if (result.error) {
        if (result.error.message && result.error.message.includes("1003")) {
          console.warn(
            "Cloudflare Workers network error (1003) in response:",
            result.error.message,
          );
          // Try to get session from tokens as fallback
          try {
            const {
              data: { session },
            } = await supabase.auth.getSession();
            if (session?.user) {
              user = session.user;
              console.info(
                "Recovered user from session after 1003 error in response",
              );
            }
          } catch (sessionError) {
            console.warn("Session fallback also failed:", sessionError);
          }
        } else {
          console.warn("Auth error in protected route:", result.error.message);
        }
      } else {
        user = result.data.user;
      }
    } catch (error) {
      // Handle specific Cloudflare Workers errors (thrown exceptions)
      if (error instanceof Error) {
        if (error.message.includes("1003")) {
          console.warn(
            "Cloudflare Workers network error (1003) in catch:",
            error.message,
          );
          // Try to get session from tokens as fallback
          try {
            const {
              data: { session },
            } = await supabase.auth.getSession();
            if (session?.user) {
              user = session.user;
              console.info(
                "Recovered user from session after 1003 error in catch",
              );
            }
          } catch (sessionError) {
            console.warn("Session fallback also failed:", sessionError);
          }
        } else {
          console.warn("Auth error in protected route:", error.message);
        }
      }
    }

    if (user) {
      // Add user to locals for use in routes
      locals.user = user;
      const response = await next();
      return pathname.startsWith("/api/") ? addCorsHeaders(response) : response;
    }

    // If API request, return 401
    if (pathname.startsWith("/api/")) {
      return addCorsHeaders(
        new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }),
      );
    }

    // For page requests, redirect to login with return URL
    const returnUrl = encodeURIComponent(pathname);
    return context.redirect(`/auth/login?returnTo=${returnUrl}`);
  },
);
