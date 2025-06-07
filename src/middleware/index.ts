import { defineMiddleware } from "astro:middleware";
import type { MiddlewareHandler } from "astro";
import { createSupabaseServerInstance } from "../db/supabase.client";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
  "/api/generations",
  "/api/debug/auth",
  "/debug/auth", // Debug page
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

    // Create Supabase client according to @supabase-auth guidelines
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Store Supabase client in locals for reuse
    locals.supabase = supabase;

    // Skip auth check for public paths
    if (isPublicPath(pathname)) {
      // Even for public paths, try to get user if logged in
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          locals.user = user;
        }
      } catch (error) {
        // Log auth errors for debugging, but don't block public paths
        console.warn("Auth check failed on public path:", error);
      }

      const response = await next();
      return pathname.startsWith("/api/") ? addCorsHeaders(response) : response;
    }

    // IMPORTANT: Always get user session first before any other operations
    // Following @supabase-auth guidelines - simple auth.getUser() call
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (user) {
      // Add user to locals for use in routes
      locals.user = user;
      const response = await next();
      return pathname.startsWith("/api/") ? addCorsHeaders(response) : response;
    }

    // Log auth errors for debugging
    if (error) {
      console.warn("Authentication failed:", {
        message: error.message,
        status: error.status,
        pathname,
      });
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
